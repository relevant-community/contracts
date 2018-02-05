
const BondingCurveMock = artifacts.require('../contracts/mocks/BondingCurveUniversalMock.sol');
const utils = require('../utils');

contract('BondingCurveUniversal', accounts => {
  let instance;
  const decimals = 18;
  const startSupply = 10 * 10 ** 18; // 1
  const startPoolBalance = 10 ** 14; // one coin costs .0001 ether;
  const reserveRatio = Math.round(1 / 3 * 1000000) / 1000000;
  const solRatio = Math.floor(reserveRatio * 1000000);
  const gasPriceBad = 22 * 10 ** 18 + 1;

  before(async () => {
    instance = await BondingCurveMock.new(startSupply, startPoolBalance, solRatio);
  });

  async function getRequestParams(amount) {
    let supply = await instance.totalSupply.call();
    supply = supply.valueOf();
    let poolBalance = await instance.poolBalance.call();
    poolBalance = poolBalance.valueOf();

    let price = poolBalance * ((1 + amount * (10 ** 18) / supply) ** (1 / (reserveRatio)) - 1);
    return {
      supply, poolBalance, solRatio, price
    };
  }

  it('should estimate price for token amount correctly', async () => {
    let amount = 13;
    let p = await getRequestParams(amount);
    let estimate = await instance.calculatePurchaseReturn.call(
      p.supply,
      p.poolBalance,
      solRatio,
      p.price
    );

    assert.isAtMost(Math.abs(estimate.valueOf() / (10 ** 18) - amount), 1, 'estimate should equal original amount');
  });

  it('should buy tokens correctly via default function', async () => {
    let amount = 8;

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

  it('should buy tokens correctly', async () => {
    let amount = 14;

    const startBalance = await instance.balanceOf.call(accounts[0]);

    let p = await getRequestParams(amount);
    let buyTokens = await instance.buy({ from: accounts[0], value: Math.floor(p.price) });
    console.log('buy gas', buyTokens.receipt.gasUsed);

    // utils.logHelper(buyTokens.logs, 'LogBondingCurve');
    const endBalance = await instance.balanceOf.call(accounts[0]);
    let amountBought = endBalance.valueOf() /
      (10 ** decimals) - startBalance.valueOf() /
      (10 ** decimals);
    assert.isAtMost(Math.abs(amountBought - amount), 1, 'able to buy tokens');
  });

  it('should buy tokens a second time correctly', async () => {
    let amount = 5;

    const startBalance = await instance.balanceOf.call(accounts[0]);

    let p = await getRequestParams(amount);
    let buyTokens = await instance.buy({ from: accounts[0], value: Math.floor(p.price) });
    console.log('buy gas', buyTokens.receipt.gasUsed);

    // utils.logHelper(buyTokens.logs, 'LogBondingCurve');
    const endBalance = await instance.balanceOf.call(accounts[0]);
    let amountBought = endBalance.valueOf() /
      (10 ** decimals) - startBalance.valueOf() /
      (10 ** decimals);
    assert.isAtMost(Math.abs(amountBought - amount), 1, 'able to buy tokens');
  });

  // TODO test that correct amount gets sent back
  it('should be able to sell tokens', async () => {
    let amount = await instance.balanceOf(accounts[0]);
    let sellAmount = Math.floor(amount / 2);

    let p = await getRequestParams(amount);
    let saleReturn = await instance.calculateSaleReturn.call(
      p.supply,
      p.poolBalance,
      solRatio,
      sellAmount
    );

    let contractBalance = await web3.eth.getBalance(instance.address);

    let sell = await instance.sell(sellAmount.valueOf());
    console.log('sellTokens gas ', sell.receipt.gasUsed);
    // utils.logHelper(sell.logs, 'LogBondingCurve');

    let endContractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(saleReturn.valueOf(), contractBalance - endContractBalance, 'contract change should match salre return');

    const endBalance = await instance.balanceOf.call(accounts[0]);

    assert.isAtMost(Math.abs(endBalance.valueOf() - (amount - sellAmount)), 10 ** 17, 'balance should be correct');
  });

  // TODO test that correct amount gets sent back
  it('should be able to sell all', async () => {
    let amount = await instance.balanceOf(accounts[0]);

    let contractBalance = await web3.eth.getBalance(instance.address);

    let p = await getRequestParams(amount);
    let saleReturn = await instance.calculateSaleReturn.call(
      p.supply,
      p.poolBalance,
      solRatio,
      amount
    );

    let sell = await instance.sell(amount.valueOf());
    console.log('sellTokens gas ', sell.receipt.gasUsed);
    // utils.logHelper(sell.logs, 'LogBondingCurve');

    let endContractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(saleReturn.valueOf(), contractBalance - endContractBalance, 'contract change should match salre return');

    const endBalance = await instance.balanceOf.call(accounts[0]);
    assert.equal(endBalance.valueOf(), 0, 'balance should be 0 tokens');
  });

  it('should throw when attempting to buy with gas price higher than the universal limit', async () => {
    try {
      await instance.buy({ gasPrice: gasPriceBad, value: 10 ** 18 });
      assert(false, "didn't throw");
    } catch (error) {
      return utils.ensureException(error);
    }
    return true;
  });
});

