pragma solidity ^0.4.18;

import "../BondingCurveSqrt.sol";

contract BondingCurveSqrtMock is BondingCurveSqrt {
  function BondingCurveSqrtMock(uint _multiple, uint8 _decimals) public {
    multiple = _multiple;
    bondingCurveDecimals = _decimals;
    dec = 10 ** uint256(_decimals);
    totalSupply_ = 10 ** 14;
  }
}