pragma solidity ^0.4.18;

import "../InflationaryToken.sol";

contract InflationaryTokenMock is InflationaryToken {
  function InflationaryTokenMock(uint hoursElapsed) public {
    inflationRatePerInterval = 1000010880216701200; // 10% annual
    timeInterval = 1 hours;
    lastInflationCalc = now - hoursElapsed * 1 hours;
    totalSupply_ = 1000 * (10 ** 18);
    balances[msg.sender] = totalSupply_;
  }
}