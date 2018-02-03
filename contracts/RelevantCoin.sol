pragma solidity ^0.4.18;

import "./ConvertLib.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./BondingCurveSqrt.sol";
import "./InflationaryToken.sol";

contract RelevantCoin is BondingCurveSqrt, InflationaryToken {
  using ConvertLib for uint;

  // uint public constant MAX_UINT = (2**256) - 1;

  string public constant name = "RelevantToken";
  string public constant symbol = "REL";
  uint8 public constant decimals = 18;

  uint256 public constant TIME_INTERVAL = 1 hours;
  uint256 public constant HOURLY_INFLATION = 1000010880216701200; // 10% annual
  // uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));
  uint256 public constant INITIAL_SUPPLY = 0;

  event Log(string logString, uint value);

  /**
   * @dev Not needed right now
   * @param addr that for which to check the balance
   * @return {uint} banace in Ether
   */
  function getBalanceInEth(address addr) public view returns(uint){
    return ConvertLib.convert(balanceOf(addr),2);
  }

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
    bondingCurveDecimals = decimals;
    dec = 10 ** uint256(bondingCurveDecimals);
    multiple = 100000000000000; //100000000000000 wei 0.0001 ether

    // token params
    totalSupply_ = INITIAL_SUPPLY;
    balances[owner] = INITIAL_SUPPLY;
    Transfer(0x0, owner, INITIAL_SUPPLY);
  }

}
