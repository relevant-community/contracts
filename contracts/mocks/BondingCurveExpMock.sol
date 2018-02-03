pragma solidity ^0.4.18;

import "../BondingCurveExp.sol";

contract BondingCurveExpMock is BondingCurveExp {
  function BondingCurveExpMock(uint _multiple, uint8 _decimals) public {
    multiple = _multiple;
    bondingCurveDecimals = _decimals;
    dec = 10 ** uint256(_decimals);
    totalSupply_ = 10 ** 14;
  }
}