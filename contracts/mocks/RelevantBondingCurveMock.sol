pragma solidity ^0.4.18;

import "../RelevantBondingCurve.sol";

contract RelevantBondingCurveMock is RelevantBondingCurve {
  function RelevantBondingCurveMock(
    uint256 _totalSupply,
    uint256 _poolBalance,
    uint32 _reserveRatio,
    uint256 hoursElapsed) public {

    lastInflationCalc = now - hoursElapsed * 1 hours;
    inflationRatePerInterval = 1000010880216701200;
    timeInterval = 1 hours;

    reserveRatio = _reserveRatio;
    totalSupply_ = _totalSupply;
    poolBalance = _poolBalance;

    virtualSupply = _totalSupply;
    virtualBalance = _poolBalance;
    inflationSupply = 0;

    gasPrice = 26 * (10 ** 9);
  }
}