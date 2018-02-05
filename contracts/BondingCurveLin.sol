pragma solidity ^0.4.18;

import "./BondingCurve.sol";

/**
 * @title Linear BondingCurve
 * @dev Bonding Curve (rater line) linear y = m * x
 * to compute poolBalance for any given price use integral y = m * 1/2 * x ^ 2
 * inspired by implementations by bancor protocol and simondlr
 * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
 * notably this bonding curve is equivalent to Bancors formula
 * where reserve ratio (_connectorWeight) = 1/2
 * https://github.com/bancorprotocol/contracts/blob/master/solidity/contracts/BancorFormula.sol
 */
contract BondingCurveLin is BondingCurve {

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
    uint256 finalPrice = m * totalTokens * totalTokens / ( 2 * d * d ) - poolBalance;
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
    uint256 finalPrice = poolBalance - m * totalTokens * totalTokens / ( 2 * d * d );
    return finalPrice;
  }

  /**
   * @dev calculetes amount of tokens to mint for give Eth amount
   * based on the area under the curve based on amount
   * area = m * 1/2 * x ^ 2 <- total price of all tokens
   * we can dervive
   * poolBalance + msg.value = m * 1/2 * (totalSupply_ + newTokens) ^ 2
   * first we figure out how many tokens to mint
   * 2 * (poolBalance + msg.value)^1/2 = m * (totalSupply_ + newTokens)
   * @param price - this is the amount user is willing to pay for new tokens
   * @return tokenAmount
   */
  function estimateTokenAmountForPrice(uint256 price) public view returns(uint256 tokenAmount) {
    uint256 newTotal = sqrt((price + poolBalance) * 2 / multiple) * dec;
    return newTotal;
  }

  function sqrt(uint256 x) public pure returns (uint256 y) {
    uint256 z = (x + 1) / 2;
    y = x;
    while (z < y) {
      y = z;
      z = (x / z + z) / 2;
    }
  }
}

