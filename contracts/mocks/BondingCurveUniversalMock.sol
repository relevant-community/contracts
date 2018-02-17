pragma solidity ^0.4.18;

import "../BondingCurveUniversal.sol";

contract BondingCurveUniversalMock is BondingCurveUniversal{
  function BondingCurveUniversalMock(
    uint256 _totalSupply,
    uint256 _poolBalance,
    uint32 _reserveRatio) public {

    reserveRatio = _reserveRatio;
    totalSupply_ = _totalSupply;
    poolBalance = _poolBalance;
    gasPrice = 26 * (10 ** 9);
  }
}