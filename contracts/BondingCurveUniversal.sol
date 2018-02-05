pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./BancorFormula.sol";

/**
 * @title BondingCurve
 * @dev Bonding Curve parent contract
 * inspired by implementations by bancor protocol and simondlr
 * https://github.com/bancorprotocol/contracts
 * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
 * uses bancor formula
 */
contract BondingCurveUniversal is StandardToken, BancorFormula, Ownable {
  uint256 public poolBalance;

  // reserve ratio, represented in ppm, 1-1000000
  // 1/3 corresponds to y= multiple * x^2
  // 1/2 corresponds to y= multiple * x
  // 2/3 corresponds to y= multiple * x^1/2
  uint32 reserveRatio;

  /*
    - Front-running attacks are currently mitigated by the following mechanisms:
    TODO - minimum return argument for each conversion provides a way to define a minimum/maximum price for the transaction
    - gas price limit prevents users from having control over the order of execution

  */
  uint256 public gasPrice = 0 wei; // maximum gas price for bancor transactions


  /**
   * @dev default function
   * gas price for this one is 128686 ~ $3 - too high for fallback fn
   * do we need it?
   */
  function() public payable {
    buy();
  }

  /**
   * @dev buy tokens
   * gas cost 77508
   * @return {bool}
   */
  function buy() public validGasPrice payable returns(bool) {
    require(msg.value > 0);
    uint256 tokensToMint = calculatePurchaseReturn(totalSupply_, poolBalance, reserveRatio, msg.value);
    totalSupply_ = totalSupply_.add(tokensToMint);
    balances[msg.sender] = balances[msg.sender].add(tokensToMint);
    poolBalance = poolBalance.add(msg.value);
    LogMint(tokensToMint, msg.value);
    return true;
  }

  /**
   * @dev sell tokens
   * gase cost 86454
   * @param sellAmount amount of tokens to withdraw
   * @return {bool}
   */
  function sell(uint256 sellAmount) public validGasPrice returns(bool) {
    require(sellAmount > 0 && balances[msg.sender] >= sellAmount);
    uint256 ethAmount = calculateSaleReturn(totalSupply_, poolBalance, reserveRatio, sellAmount);
    msg.sender.transfer(ethAmount);
    poolBalance = poolBalance.sub(ethAmount);
    balances[msg.sender] = balances[msg.sender].sub(sellAmount);
    totalSupply_ = totalSupply_.sub(sellAmount);
    LogWithdraw(sellAmount, ethAmount);
    return true;
  }

  // verifies that the gas price is lower than the universal limit
  modifier validGasPrice() {
    assert(tx.gasprice <= gasPrice);
    _;
  }

  /**
      @dev allows the owner to update the gas price limit
      @param _gasPrice    new gas price limit
  */
  function setGasPrice(uint256 _gasPrice) public onlyOwner {
    require(_gasPrice > 0);
    gasPrice = _gasPrice;
  }

  event LogMint(uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
  event LogBondingCurve(string logString, uint256 value);
}

