pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./BancorFormula.sol";
import "./InflationaryToken.sol";
import "./BondingCurve.sol";

/**
 * @title Relevant Bonding Curve
 * @dev Bonding curve contract based on Bancor formula with inflation + virtual supply and balance
 * inspired by bancor protocol and simondlr
 * https://github.com/bancorprotocol/contracts
 * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
 */
contract RelevantBondingCurve is BondingCurve, InflationaryToken {
  uint256 public virtualSupply;
  uint256 public virtualBalance;
  uint256 public inflationSupply;
  uint256 public rewardPool = 0;

  /*
    when we mint new tokens we don't want to move the price of the contract
    because this would create an arbitrage opportunity if we do this at regular intervals
    so we set them aside in the inflationSupply
    its fine to use these tokens because the sale price will take them into account
   */
  function mintTokens(address _to) onlyOwner public returns (bool) {
    uint256 actualSupply = totalSupply_.sub(virtualSupply);
    uint256 newTokens = computeInflation(actualSupply);
    uint256 timeInt = timeInterval;

    // update last inflation calculation (rounding down to nearest timeInterval)
    lastInflationCalc = (now / timeInt) * timeInt;

    LogInflation("newTokens", newTokens);
    // QUESTION - what is more consistent - update totalSupply and adjust buy supply?
    inflationSupply = inflationSupply.add(newTokens);
    rewardPool = rewardPool.add(newTokens);
    return true;
  }

  /**
   * @dev buy tokens
   * gas cost 77508 / 91616 via default
   * @return {bool}
   */
  function buy() public validGasPrice payable returns(bool) {
    require(msg.value > 0);
    uint256 tokensToMint = calculatePurchaseReturn(totalSupply_, poolBalance, reserveRatio, msg.value);
    // QUESTION - what is more consistent - update totalSupply and adjust buy supply?
    totalSupply_ = totalSupply_.add(tokensToMint);
    balances[msg.sender] = balances[msg.sender].add(tokensToMint);
    poolBalance = poolBalance.add(msg.value);
    LogMint(tokensToMint, msg.value);
    return true;
  }

  /**
   * @dev sell tokens
   * we must use actual supply (totalSupply + inflationSupply) when we sell tokens
   * this function adjust the sell curve by adjusting sell ratio and keeping spot price constant
   * this creates a large bid-ask spread for large buyers and small bidask for small buyers
   * alternative method is create a more uniform bid-ask by keeping the same ratio, but letting price correct
   * gas cost 72191 - 86751
   * @param sellAmount amount of tokens to withdraw
   * @return {bool}
   */
  function sell(uint256 sellAmount) public validGasPrice returns(bool) {
    require(sellAmount > 0 && balances[msg.sender] >= sellAmount);
    uint256 tokenSupply = totalSupply_;

    require(sellAmount <= tokenSupply.sub(virtualSupply));

    /*
      compute sell ratio
      make sure we compute ceil instead of floor! (flor could result in returning more ETH than available in contract)
     */
    uint256 sellReserveRatio246 = reserveRatio * tokenSupply * (10 ** 18) / (tokenSupply + inflationSupply);
    uint32 sellReserveRatio = uint32(((sellReserveRatio246 + (10 ** 18) - 1) / (10 ** 18)));

    // QUESTION - what is more consistent - update totalSupply and adjust buy supply?
    uint256 ethAmount = calculateSaleReturn(tokenSupply + inflationSupply, poolBalance, sellReserveRatio, sellAmount);
    msg.sender.transfer(ethAmount);
    poolBalance = poolBalance.sub(ethAmount);
    balances[msg.sender] = balances[msg.sender].sub(sellAmount);
    totalSupply_ = totalSupply_.sub(sellAmount);
    LogWithdraw(sellAmount, ethAmount);
    return true;
  }
}
