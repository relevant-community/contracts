pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./BancorFormula.sol";
import "./InflationaryToken.sol";
import "./BondingCurveUniversal.sol";

/**
 * @title Relevant Bonding Curve
 * @dev Bonding curve contract based on bacor formula with inflation and virtual supply and balance
 * inspired by bancor protocol and simondlr
 * https://github.com/bancorprotocol/contracts
 * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
 * uses bancor formula
 */
contract RelevantBondingCurve is BondingCurveUniversal, InflationaryToken {
  uint256 public virtualSupply;
  uint256 public virtualBalance;
  uint256 public inflationSupply;
  uint256 public rewardPool = 0;

  function mintTokens(address _to) onlyOwner public returns (bool) {
    uint256 actualSupply = totalSupply_.sub(virtualSupply);
    uint256 newTokens = computeInflation(actualSupply);
    uint256 timeInt = timeInterval;

    // update last inflation calculation (rounding down to nearest timeInterval)
    lastInflationCalc = (now / timeInt) * timeInt;

    LogInflation("newTokens", newTokens);
    inflationSupply = inflationSupply.add(newTokens);
    rewardPool = rewardPool.add(newTokens);
    return true;
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
   * this function adjust the sell curve by adjusting sell ratio and reserve pool
   * this creates a large bid-ask spread for large buyers and small bidask for small buyers
   * alternative method is create a uniform bid-ask by adjust tokenSupply
   * gase cost 86454
   * @param sellAmount amount of tokens to withdraw
   * @return {bool}
   */
  function sell(uint256 sellAmount) public validGasPrice returns(bool) {
    require(sellAmount > 0 && balances[msg.sender] >= sellAmount);
    uint256 tokenSupply = totalSupply_;

    require(sellAmount <= tokenSupply.sub(virtualBalance));
    // compute sell ratio rounding?
    uint32 sellReserveRatio = uint32(reserveRatio * tokenSupply / (tokenSupply + inflationSupply));
    uint256 sellPoolBalance = poolBalance * sellReserveRatio / reserveRatio;

    uint256 ethAmount = calculateSaleReturn(tokenSupply, sellPoolBalance, sellReserveRatio, sellAmount);
    msg.sender.transfer(ethAmount);
    poolBalance = poolBalance.sub(ethAmount);
    balances[msg.sender] = balances[msg.sender].sub(sellAmount);
    totalSupply_ = totalSupply_.sub(sellAmount);
    LogWithdraw(sellAmount, ethAmount);
    return true;
  }
}
