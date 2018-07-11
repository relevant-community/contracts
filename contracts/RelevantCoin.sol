pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./RelevantBondingCurve.sol";

contract RelevantCoin is RelevantBondingCurve {
  string public constant name = "RelevantToken";
  string public constant symbol = "RNT";
  uint8 public constant decimals = 18;

  uint256 public constant TIME_INTERVAL = 1 minutes;
  uint256 public constant HOURLY_INFLATION = 1000010880216701200; // 10% annual
  uint256 public constant INITIAL_SUPPLY = 2000000 * (10 ** 18);
  uint256 public constant INITIAL_PRICE = 39 * (10 ** 13);
  uint32 public constant CURVE_RATIO = 150000;
  uint256 public constant INITAL_BALANCE = CURVE_RATIO * INITIAL_SUPPLY * INITIAL_PRICE / (1000000 * 10 ** 18);

  event Log(string logString, uint value);

	/**
	 * @dev Constructor that gives msg.sender all of existing tokens.
	 */
  function RelevantCoin() public {
    owner = msg.sender;

    // inflation params
    lastInflationCalc = now;
    inflationRatePerInterval = HOURLY_INFLATION;
    timeInterval = TIME_INTERVAL;

    // bonding curve params
    reserveRatio = CURVE_RATIO;
    totalSupply_ = INITIAL_SUPPLY;
    virtualSupply = INITIAL_SUPPLY;
    poolBalance = INITAL_BALANCE;
    virtualBalance = INITAL_BALANCE;
    inflationSupply = 0;
    gasPrice = 26 * (10 ** 9);

    // token params
    totalSupply_ = INITIAL_SUPPLY;
    // balances[owner] = INITIAL_SUPPLY;
    // Transfer(0x0, owner, INITIAL_SUPPLY);
  }

}
