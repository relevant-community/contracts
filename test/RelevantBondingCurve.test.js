
const BondingCurveMock = artifacts.require('../contracts/mocks/RelevantBondingCurveMock.sol');
const utils = require('../utils');

contract('BondingCurveUniversal', accounts => {
  let instance;
  const decimals = 18;
  const startSupply = 1000000 * (10 ** 18);
  const startPoolBalance = 2 * (10 ** 16);
  const reserveRatio = Math.round(.15 * 1000000) / 1000000;
  const solRatio = Math.floor(reserveRatio * 1000000);
  // const gasPriceBad = 22 * 10 ** 18 + 1;
  const hours = 24;

  before(async () => {
    instance = await BondingCurveMock.new(startSupply, startPoolBalance, solRatio, hours);
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

  it('should buy tokens correctly via default function', async () => {
    let amount = 100;

    const startBalance = await instance.balanceOf.call(accounts[0]);
    let p = await getRequestParams(amount);
    let buyTokens = await instance.send(Math.floor(p.price));
    console.log('buyTokens via default gas', buyTokens.receipt.gasUsed);

    // utils.logHelper(buyTokens.logs, 'LogBondingCurve');

    const endBalance = await instance.balanceOf.call(accounts[0]);
    let amountBought = endBalance.valueOf() /
      (10 ** decimals) - startBalance.valueOf() /
      (10 ** decimals);
    assert.isAtMost(Math.abs(amountBought - amount), 1, 'able to buy tokens via fallback');
  });

  it('should create tokens via inflation', async () => {

    let p = await getRequestParams();
    let virtualSupply = await instance.virtualSupply.call();
    let actualSupply = p.supply - virtualSupply.toNumber();
    // actualSupply /= (10 ** decimals);

    const result = await instance.mintTokens(accounts[0]);
    console.log('inflation gas ', result.receipt.gasUsed);

    let inflationSupply = await instance.inflationSupply.call();
    inflationSupply = 1 * inflationSupply.valueOf();
    console.log('infaltionSupply ', inflationSupply.valueOf());

    let rate = 1.1 ** (hours / (365 * 24)) - 1;
    let inflationSupplyTest = actualSupply * rate;
    console.log(inflationSupplyTest);
    // utils.logHelper(buyTokens.logs, 'LogBondingCurve');
    assert.isAtMost(Math.abs(inflationSupplyTest - inflationSupply), 10 ** 8, 'should mint correct amount of tokens');
  });

  it('should be able to sell all', async () => {
    let amount = await instance.balanceOf(accounts[0]);

    let contractBalance = await web3.eth.getBalance(instance.address);

    let inflationSupply = await instance.inflationSupply.call();
    inflationSupply = 1 * inflationSupply.valueOf();

    let p = await getRequestParams(amount);
    console.log('total + inf ', p.supply + inflationSupply);
    let saleReturn = await instance.calculateSaleReturn.call(
      p.supply,
      p.poolBalance,
      solRatio,
      amount
    );

    console.log('saleReturn ', saleReturn.toNumber());

    let sell = await instance.sell(amount.valueOf());
    console.log('sellTokens gas ', sell.receipt.gasUsed);
    utils.logHelper(sell.logs, 'LogBondingCurve');

    const endBalance = await instance.balanceOf.call(accounts[0]);
    assert.equal(endBalance.valueOf(), 0, 'balance should be 0 tokens');

    let endContractBalance = await web3.eth.getBalance(instance.address);
    console.log(contractBalance);
    console.log(endContractBalance);
    assert.equal(saleReturn.valueOf(), contractBalance - endContractBalance, 'contract change should match salre return');

  });

});
