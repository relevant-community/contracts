pragma solidity ^0.4.18;

import "./BondingCurve.sol";

/**
 * @title BondingCurve
 * @dev Bonding Curve based on a x^2 root curve
 * to compute poolBalance for any given price use integral y = m * 1/3 * x ^ 3
 * inspired by implementations by bancor protocol and simondlr
 * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
 * notably this bonding curve is equivalent to Bancors formula
 * where reserve ratio (_connectorWeight) = 1/3
 * https://github.com/bancorprotocol/contracts/blob/master/solidity/contracts/BancorFormula.sol
 */
contract BondingCurveExp is BondingCurve {

  /**
   * Get price for purchacing tokenAmount of tokens
   * @param tokenAmount token amount param
   * @return {uint} finalPrice
   */
  function getBuyPrice(uint256 tokenAmount) public view returns(uint) {
    uint256 totalTokens = tokenAmount + totalSupply_;
    uint256 m = multiple;
    uint256 d = dec;
    // TODO check overflow
    // same as totalTokens^3
    uint256 newPrice = totalTokens * totalTokens / d * totalTokens / d;
    uint256 finalPrice = m * newPrice / ( 3 * d ) - poolBalance;
    return finalPrice;
  }

  /**
   * Get sell price for tokenAmount
   * @param tokenAmount token amount param
   * @return {uint} finalPrice
   */
  function getSellReward(uint256 tokenAmount) public view returns(uint) {
    require(totalSupply_ >= tokenAmount);
    uint256 totalTokens = totalSupply_ - tokenAmount;
    uint256 m = multiple;
    uint256 d = dec;
    // TODO check overflow
    // same as totalTokens^3
    uint256 newPrice = totalTokens * totalTokens / d * totalTokens / d;
    uint256 finalPrice = poolBalance - m * newPrice * 1 / ( 3 * d );
    return finalPrice;
  }

  /**
   * @dev calculates the area under the curve based on amount
   * area = m * 1/3 * x ^ 3 <- total price of all tokens
   * we can dervive:
   * poolBalance + msg.value = m * 1/3 * (totalSupply_ + newTokens) ^ 1/3
   * first we figure out how many tokens to mint
   * (poolBalance + msg.value) * 3 / m = (totalSupply_ + newTokens)^3
   * since there is no good way to do cubed root, we iterate to find newTokens
   * then use the previous formula to get actual price
   * using dec is to convert to fixed float
   * @param price - this is the amount user is willing to pay for new tokens
   * @return tokenAmount
   */
  function estimateTokenAmountForPrice(uint256 price) public view returns(uint256 tokenAmount) {
    // optimization
    uint256 m = multiple;
    uint256 d = dec;
    uint256 pb = poolBalance;
    uint256 totalSupply = totalSupply_;

    // maximum amount for estimates
    uint8 maxSale = 10 ** 2;
    uint256 currentAmount = (price + pb);
    uint256 newPrice;

    // TODO modify these intervals, as tokens get more expensive, we will wnat to use smaller intervals
    for (uint8 i = 1; i < maxSale; i++) {
      uint256 totalTokens = i * d + totalSupply;
      // TODO check overflow
      // same as totalTokens^3 * multiple^2
      newPrice = (totalTokens * totalTokens / d) * (totalTokens);
      if (currentAmount < m * newPrice / (3 * d * d)) {
        break;
      }
    }

    return (i - 1) * d;
  }

  /**
   * Current cost of tokens - (not really needed - can use getBuyPrice)
   * @dev Calculates current cost of new token - carefull accuracy is proportional to basePrice
   * @return {uint} cost of token
   */
  function currentCost(uint256 _totalBound) public view returns (uint256 _cost) {
    uint256 cost = multiple * _totalBound * _totalBound / ( dec * dec );
    return cost;
  }
}

