
module.exports = _type => {
  const type = _type;

  const BondingCurveMock = artifacts.require('../contracts/mocks/BondingCurve' + type + 'Mock.sol');
  const utils = require('../utils');

  contract('BondingCurve' + type, function (accounts) {
    let instance;
    const decimals = 18;
    let multiple = 10 ** 10;

    before(async function () {
      instance = await BondingCurveMock.new(multiple, decimals);
    });

    it('should estimate amount for price', async function () {
      let amount = 61;
      let priceOfTokens = await instance.getBuyPrice.call(amount * (10 ** decimals));
      priceOfTokens = priceOfTokens.valueOf();

      let estimate = await instance.estimateTokenAmountForPrice.call(priceOfTokens);
      assert.isAtMost(estimate.valueOf() / (10 ** decimals) - amount, 1, 'estimate should equal original amount');
    });

    it('should buy tokens correctly via default function', async function () {
      let amount = 80;
      let priceOfTokens = await instance.getBuyPrice.call(amount * (10 ** decimals));
      priceOfTokens = priceOfTokens.valueOf();

      const startBalance = await instance.balanceOf.call(accounts[0]);

      let buyTokens = await instance.send(priceOfTokens);
      console.log('buyTokens via default gas', buyTokens.receipt.gasUsed);

      // utils.logHelper(buyTokens.logs, 'LogBondingCurve');

      const endBalance = await instance.balanceOf.call(accounts[0]);
      let amountBought = endBalance.valueOf() /
        (10 ** decimals) - startBalance.valueOf() /
        (10 ** decimals);
      console.log(endBalance.valueOf() / (10 ** decimals));
      assert.isAtMost(Math.abs(amountBought - amount), 1, 'able to buy tokens via fallback');
    });

    it('should buy tokens correctly', async function () {
      let amount = 200;
      let priceOfTokens = await instance.getBuyPrice.call(amount * (10 ** decimals));
      priceOfTokens = priceOfTokens.valueOf();
      let totalSupply = await instance.totalSupply.call();
      totalSupply = totalSupply.valueOf() / (10 ** decimals);
      let poolBalance = await instance.poolBalance.call();
      poolBalance = poolBalance.valueOf();

      const startBalance = await instance.balanceOf.call(accounts[0]);

      let priceShouldBe;
      if (type === 'Sqrt') {
        priceShouldBe = multiple * 2 / 3 * (amount + totalSupply) ** (3 / 2) - poolBalance;
      } else if (type === 'Exp') {
        priceShouldBe = multiple * 1 / 3 * (amount + totalSupply) ** 3 - poolBalance;
      } else if (type === 'Lin') {
        priceShouldBe = multiple * 1 / 2 * (amount + totalSupply) ** 2 - poolBalance;
      }

      assert.isAtMost(Math.abs(Math.floor(priceShouldBe) - priceOfTokens), 1000, 'price should be close to calc');

      let buyTokens = await instance.buyTokens(
        amount * (10 ** decimals),
        { from: accounts[0], value: priceOfTokens }
      );
      console.log('buyTokens gas', buyTokens.receipt.gasUsed);

      // utils.logHelper(buyTokens.logs, 'LogBondingCurve');

      const endBalance = await instance.balanceOf.call(accounts[0]);
      assert.equal(endBalance.valueOf() / (10 ** decimals) - startBalance.valueOf() / (10 ** decimals), amount, 'able to buy tokens');
    });

    it('should buy tokens a second time correctly', async function () {
      let amount = 90;
      let priceOfTokens = await instance.getBuyPrice.call(amount * (10 ** decimals));
      priceOfTokens = priceOfTokens.toNumber();
      let totalSupply = await instance.totalSupply.call();
      totalSupply = totalSupply.valueOf() / (10 ** decimals);
      let poolBalance = await instance.poolBalance.call();
      poolBalance = poolBalance.valueOf();

      const startBalance = await instance.balanceOf.call(accounts[0]);

      let priceShouldBe;
      if (type === 'Sqrt') {
        priceShouldBe = multiple * 2 / 3 * (amount + totalSupply) ** (3 / 2) - poolBalance;
      } else if (type === 'Exp') {
        priceShouldBe = multiple * 1 / 3 * (amount + totalSupply) ** 3 - poolBalance;
      } else if (type === 'Lin') {
        priceShouldBe = multiple * 1 / 2 * (amount + totalSupply) ** 2 - poolBalance;
      }

      assert.isAtMost(Math.abs(priceShouldBe - priceOfTokens), 1000, 'price should be close to calc');

      let buyTokens = await instance.buyTokens(
        amount * (10 ** decimals),
        { from: accounts[0], value: priceOfTokens }
      );
      console.log('buyTokens gas', buyTokens.receipt.gasUsed);

      // utils.logHelper(buyTokens.logs, 'LogBondingCurve');
      const endBalance = await instance.balanceOf.call(accounts[0]);
      assert.equal(endBalance.valueOf() / (10 ** decimals) - startBalance.valueOf() / (10 ** decimals), amount, 'able to buy tokens the quick way');

      // TEST Sell Reward
      let sellReward = await instance.getSellReward.call(amount * (10 ** decimals));
      assert.equal(sellReward.valueOf(), priceOfTokens.valueOf(), 'sell reward should match buy price');
    });

    it('should compute bonding curve price correctly', async function () {
      let amount = 69;
      let price = await instance.currentCost.call(amount * (10 ** decimals));
      price = price.valueOf();
      let priceShouldBe;

      if (type === 'Sqrt') {
        priceShouldBe = multiple * Math.sqrt(amount);
      } else if (type === 'Exp') {
        priceShouldBe = multiple * amount * amount;
      } else if (type === 'Lin') {
        priceShouldBe = multiple * amount;
      }
      assert.isBelow(Math.abs((price - priceShouldBe) / price), 1 / (10 ** (decimals / 2)), 'price should be close to expected');
    });

    it('should return same results as bancor formula', async function () {
      let reserveRatio;
      let supply = await instance.totalSupply.call();
      let balance = await instance.poolBalance.call();

      let price;
      if (type === 'Sqrt') {
        reserveRatio = 2 / 3;
        price = multiple * Math.sqrt(supply) / 10 ** (decimals / 2);
      } else if (type === 'Exp') {
        reserveRatio = 1 / 3;
        price = multiple * supply * supply / 10 ** (decimals * 2);
      } if (type === 'Lin') {
        reserveRatio = 1 / 2;
        price = multiple * supply / 10 ** (decimals);
      }

      // amount to buy
      let amount = 19;

      let reserve = supply.valueOf() * price.valueOf() * reserveRatio / (10 ** decimals);
      reserve = Math.floor(reserve);

      assert.isAtMost(Math.abs(reserve - balance.valueOf()), 1000, 'balance should match reserve');

      supply = supply.valueOf() / (10 ** decimals);

      // ref https://drive.google.com/file/d/0B3HPNP-GDn7aRkVaV3dkVl9NS2M/view
      let bancorPrice = reserve * ((1 + amount / supply) ** (1 / reserveRatio) - 1);
      bancorPrice = Math.floor(bancorPrice);

      let ourPrice = await instance.getBuyPrice.call(amount * (10 ** decimals));

      assert.isAtMost(Math.abs(bancorPrice - ourPrice.valueOf()), 1000, 'our price to buy amount of tokens should match bancor formula');
    });

    it('should be able to sell tokens', async function () {
      let amount = await instance.balanceOf(accounts[0]);
      let sellAmount = Math.floor(amount / 2);
      let sell = await instance.sellTokens(sellAmount.valueOf());
      console.log('sellTokens gas ', sell.receipt.gasUsed);
      const endBalance = await instance.balanceOf.call(accounts[0]);
      assert.equal(endBalance.valueOf(), amount - sellAmount, 'balance should be correct');
    });

    it('should be able to sell all', async function () {
      let amount = await instance.balanceOf(accounts[0]);
      let sell = await instance.sellTokens(amount.valueOf());
      console.log('sellTokens gas ', sell.receipt.gasUsed);
      const endBalance = await instance.balanceOf.call(accounts[0]);
      assert.equal(endBalance.valueOf(), 0, 'balance should be 0 tokens');
    });
  });
};
