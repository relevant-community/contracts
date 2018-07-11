// import logHelper from './helpers/logHelper';
import assertRevert from './helpers/assertRevert';

const RelevantBondingCurveMock = artifacts.require('RelevantBondingCurveMock.sol');
const ECRecovery = artifacts.require('ECRecovery.sol');

const web3Utils = require('web3-utils');

contract('RelevantBondingCurve', accounts => {
  // let provider = new web3.providers.HttpProvider('http://127.0.0.1:7545');
  // myweb3 = new MyWeb3(web3.currentProvider);
  let instance;
  const decimals = 18;
  const startSupply = 1000000000 * (10 ** 18);
  const startPoolBalance = 60 * (10 ** 18);
  const reserveRatio = Math.round(0.15 * 1000000) / 1000000;
  const solRatio = Math.floor(reserveRatio * 1000000);
  // const gasPriceBad = 22 * 10 ** 18 + 1;
  const hours = 6;

  before(async () => {
    let lib = await ECRecovery.new();
    RelevantBondingCurveMock.link('ECRecovery', lib.address);
    instance = await RelevantBondingCurveMock.new(startSupply, startPoolBalance, solRatio, hours);
  });

  async function getRequestParams(amount) {
    let supply = await instance.totalSupply.call();
    supply = 1 * supply.valueOf();
    let poolBalance = await instance.poolBalance.call();
    poolBalance = 1 * poolBalance.valueOf();

    let price = poolBalance * ((1 + amount * (10 ** 18) / supply) ** (1 / (reserveRatio)) - 1);
    return {
      supply, poolBalance, solRatio, price
    };
  }

  it('should call intervalsSinceLastInflationUpdate correctly', async () => {
    let interval = await instance.intervalsSinceLastInflationUpdate.call();
    assert.equal(interval.toNumber(), hours, 'interval should equal default hours');
  });

  it('should buy tokens correctly via default function', async () => {
    let amount = 100;

    const startBalance = await instance.balanceOf.call(accounts[1]);
    let p = await getRequestParams(amount);
    let buyTokens = await instance.sendTransaction({ value: Math.floor(p.price), from: accounts[1] });
    console.log('buyTokens via default gas', buyTokens.receipt.gasUsed);

    // logHelper(buyTokens.logs, 'LogBondingCurve');

    const endBalance = await instance.balanceOf.call(accounts[1]);
    let amountBought = endBalance.valueOf() /
      (10 ** decimals) - startBalance.valueOf() /
      (10 ** decimals);
    assert.isAtMost(Math.abs(amountBought - amount), 1, 'able to buy tokens via fallback');
  });

  it('should create tokens via inflation', async () => {
    let virtualSupply = await instance.virtualSupply.call();
    let totalSupply = await instance.totalSupply.call();
    let actualSupply = totalSupply.sub(virtualSupply);
    let startRewardPool = await instance.rewardPool.call();

    const result = await instance.mintRewardTokens();
    console.log('inflation gas ', result.receipt.gasUsed);

    let inflationSupply = await instance.inflationSupply.call();

    let endRewardPool = await instance.rewardPool.call();

    let hourlyRate = Math.round((1.1) ** (1 / (365 * 24)) * 1e18);
    let rate = new web3.BigNumber(hourlyRate.toString());

    for (let i = 1; i < hours; i++) {
      rate = rate.mul(hourlyRate.toString()).div(1e18);
    }
    let inflationSupplyTest = rate.mul(actualSupply).div(1e18).sub(actualSupply);

    // logHelper(buyTokens.logs, 'LogBondingCurve');
    assert.isAtMost(Math.abs(inflationSupply.sub(inflationSupplyTest)), 1e3, 'should mint correct amount of tokens');
    assert.equal(endRewardPool.sub(startRewardPool).sub(inflationSupply).toNumber(), 0, 'reward pool should equal inf supply');
  });

  it('should be able to allocateRewards', async () => {
    let amount = 1;
    let startDist = await instance.distributedRewards.call();
    let startRewardPool = await instance.rewardPool.call();

    await instance.allocateRewards(amount);
    let endDist = await instance.distributedRewards.call();
    let endRewardPool = await instance.rewardPool.call();

    assert.equal(endDist.sub(startDist).toNumber(), 1, 'should increase distributedRewards');
    assert.equal(startRewardPool.sub(endRewardPool).toNumber(), 1, 'should decrease rewardPool');
  });

  it('should distribute rewards', async () => {
    web3.BigNumber.config({ DECIMAL_PLACES: 5 });
    let rewardPool = await instance.rewardPool.call();
    let tenth = rewardPool.dividedToIntegerBy(10);
    let balances = accounts.map(() => tenth);
    let startBalance = await instance.balanceOf(accounts[3]);
    let distribute = await instance.distributeRewards(accounts, balances);

    console.log('dist gas', distribute.receipt.gasUsed);
    let endBalance = await instance.balanceOf(accounts[3]);
    assert.equal(endBalance.sub(startBalance).sub(tenth).toNumber(), 0, 'should distribute correct amount');

    let endRewardPool = await instance.rewardPool.call();
    assert.equal(rewardPool.sub(tenth.mul(10)).sub(endRewardPool).toNumber(), 0, 'should update reward pool');
  });

  it('should be able to sell all', async () => {
    let amount = await instance.balanceOf(accounts[0]);

    let contractBalance = await web3.eth.getBalance(instance.address);
    let totalSupply = await instance.totalSupply.call();
    let inflationSupply = await instance.inflationSupply.call();
    let poolBalance = await instance.poolBalance.call();
    let virtualSupply = await instance.virtualSupply.call();
    let virtualBalance = await instance.virtualBalance.call();

    let p = await getRequestParams(amount);
    let sellRatio = solRatio * p.supply / (p.supply + inflationSupply.toNumber());
    // sell Ratio should use ceil instead of floor because its used as inverse power
    // and could result in more ETH returned as a result of rounding error
    sellRatio = Math.ceil(sellRatio);

    // this will fail if actual supply is very close to amount
    let saleReturn = await instance.calculateSaleReturn.call(
      totalSupply.add(inflationSupply).sub(virtualSupply),
      poolBalance.sub(virtualBalance),
      sellRatio,
      amount
    );

    let sell = await instance.sell(amount);
    console.log('sellTokens gas ', sell.receipt.gasUsed);
    // logHelper(sell.logs, 'LogBondingCurve');

    const endBalance = await instance.balanceOf.call(accounts[0]);
    assert.equal(endBalance.valueOf(), 0, 'balance should be 0 tokens');

    let endContractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(saleReturn.valueOf(), contractBalance - endContractBalance, 'contract change should match sale return');
  });

  it('owner should be able to buy virtual tokens', async () => {
    let virtualBalance = await instance.virtualBalance.call();
    let virtualSupply = await instance.virtualSupply.call();
    let startPoolBalance = await instance.poolBalance.call();


    console.log('virtualBalance ', virtualBalance.toNumber());
    let spend = 20 * 1e18; // 20 ETH
    let startBalance = await instance.balanceOf(accounts[0]);

    let buyVirtualTokens = await instance.buyVirtualTokens({ value: spend, from: accounts[0] });
    console.log('buyVirtualTokens gas ', buyVirtualTokens.receipt.gasUsed);

    let endBalance = await instance.balanceOf(accounts[0]);
    let endVirtualSupply = await instance.virtualSupply.call();
    let endVirtualBalance = await instance.virtualBalance.call();
    let endPoolBalance = await instance.poolBalance.call();

    let shouldBuy = virtualSupply.mul(spend).div(virtualBalance);

    assert.equal(endBalance.sub(startBalance).toNumber(), shouldBuy.toNumber(), 'should get correct amount of tokens');
    assert.equal(virtualSupply.sub(endVirtualSupply).toNumber(), shouldBuy.toNumber(), 'virtualSupply should update');
    assert.equal(virtualBalance.sub(endVirtualBalance).toNumber(), spend, 'balance should update');
    assert.equal(endPoolBalance.sub(startPoolBalance).toNumber(), spend, 'pool balance should update');
  });

  it('owner should be able to add tokens to distributed rewards', async () => {
    let amount = await instance.balanceOf(accounts[0]);
    let startDist = await instance.distributedRewards.call();

    await instance.addRewards(amount);
    let endDist = await instance.distributedRewards.call();

    let endBalance = await instance.balanceOf(accounts[0]);

    assert.equal(endDist.sub(startDist).sub(amount).toNumber(), 0, 'should add rewards correctly');
    assert.equal(endBalance.toNumber(), 0, 'should updated owner account');
  });

  it('should be able to cash out and fail with used nonce', async () => {
    let amount = await instance.distributedRewards.call();
    let startBalance = await instance.balanceOf(accounts[1]);

    let nonce = await instance.nonceOf.call(accounts[1]);
    let hash = web3Utils.soliditySha3(amount, accounts[1], nonce.toNumber());
    let sig = await web3.eth.sign(accounts[0], hash);

    let cashOut = await instance.cashOut(amount, sig, { from: accounts[1] });
    console.log('cashOut gas ', cashOut.receipt.gasUsed);

    let endBalance = await instance.balanceOf(accounts[1]);
    assert.equal(endBalance.sub(startBalance).toNumber(), amount, 'should cash out correctly');

    // should fail with previous nonce
    await assertRevert(instance.cashOut(amount, sig, { from: accounts[1] }));
  });
});

