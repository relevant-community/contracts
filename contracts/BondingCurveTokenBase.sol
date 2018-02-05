pragma solidity ^0.4.18;

import "./BondingCurve.sol";

/**
 * @title BondingCurve
 * @dev Bonding Curve parent contract
 * inspired by implementations by bancor protocol and simondlr
 * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
 * children should implement getBuyPrice, getSellReward, estimateTokenAmountForPrice, currentCost
 */
contract BondingCurveTokenBase is BondingCurve {

  // if prefer to use ERC20 for purchase/sell instead of Eth
  ERC20 basetoken;
  uint256 basetokenDec;

  /**
   * @dev default function
   * gas price for this one is 128686 ~ $3 - too high for fallback fn
   * do we need it? >> doens't work for ERC20
   */
  function() public payable {
    revert();
  }

  /**
   * @dev Buy tokens
   * gas cost ~ $1.5
   * @param tokensToMint tokens we want to buy
   * @return {bool}
   */
  function buyTokens(uint256 tokensToMint) public returns(bool) {
    uint256 priceForAmount = getBuyPrice(tokensToMint);
    require(basetoken.transferFrom(msg.sender, address(this), priceForAmount));

    totalSupply_ += tokensToMint;
    balances[msg.sender] += tokensToMint;
    poolBalance += priceForAmount;
    LogMint(tokensToMint, priceForAmount);
    return true;
  }

  /**
   * @dev sell tokesn
   * @param _amountToWithdraw amount of tokens to withdraw
   * @return {bool}
   */
  function sellTokens(uint256 _amountToWithdraw) public returns(bool) {
    require(_amountToWithdraw > 0 && balances[msg.sender] >= _amountToWithdraw);
    //determine how much you can leave with.
    uint256 reward = getSellReward(_amountToWithdraw);
    require(basetoken.transfer(msg.sender, reward));
    poolBalance -= reward;
    balances[msg.sender] -= _amountToWithdraw;
    totalSupply_ -= _amountToWithdraw;
    LogWithdraw(_amountToWithdraw, reward);
    return true;
  }

}

