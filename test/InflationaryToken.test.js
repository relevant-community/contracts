
const InflationaryTokenMock = artifacts.require('../contracts/mocks/InflationaryTokenMock.sol');

contract('InflationaryToken', function (accounts) {
  let instance;
  const hours = 3;

  beforeEach(async function () {
    instance = await InflationaryTokenMock.new(hours);
  });

  it('should mint inflation coin correctly', async function () {
    const contractOwner = accounts[0];

    const startSupply = await instance.totalSupply.call();

    const result = await instance.mintTokens(contractOwner);
    console.log('inflation gas ', result.receipt.gasUsed);

    result.logs.forEach(l => {
      if (l.event === 'LogInflation') {
        // console.log(l.args.logString, ' ',  l.args.value.toNumber() / (10 ** 18));
        if (l.args.logString === 'rate') {
          // console.log('rate should be close to ', Math.pow(1.1, hours / (365*24)))
          let rate = 1.1 ** (hours / (365 * 24));
          let res = l.args.value.toNumber() / (10 ** 18);
          assert.isBelow(Math.abs(rate - res), 1 / (10 ** 12), 'inflation should be calculated correctly');
          if (hours !== 0x0) {
            assert.isAbove(rate, 0);
          }
        }
      }
    });

    const endBalanceAcc1 = await instance.balanceOf.call(contractOwner);
    const endSupply = await instance.totalSupply.call();

    assert.isAbove(endSupply.toNumber(), startSupply.toNumber(), 'End supply should be greater than start');
    assert.equal(endSupply.toNumber(), endBalanceAcc1.toNumber(), 'Should disburse amount to user correctly');
  });
});
