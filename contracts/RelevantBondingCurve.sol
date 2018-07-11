pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/ECRecovery.sol";
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
  using ECRecovery for bytes32;

  uint256 public virtualSupply;
  uint256 public virtualBalance;
  uint256 public inflationSupply;
  uint256 public distributedRewards;
  uint256 public rewardPool = 0;
  mapping(address => uint256) nonces;

  /**
   * @dev Nonce of user
   * @param _account User account
   * @return nonce of user
   */
  function nonceOf(address _account) public view returns(uint256) {
    return nonces[_account];
  }

  /**
   * @dev Cashout
   * @param  _amount amount to be transferred to user
   * @param  _sig Signature by contract owner authorizing the transaction
   */
  function cashOut(uint256 _amount, bytes _sig) public returns(bool) {
    // check _aount + account matches hash
    require(distributedRewards >= _amount);

    bytes32 hash = keccak256(_amount, msg.sender, nonces[msg.sender]);
    hash = keccak256('\x19Ethereum Signed Message:\n32', hash);

    // check that the message was signed by contract owner
    // LogAddress(signer);

    require(owner == hash.recover(_sig));
    nonces[msg.sender] += 1;
    distributedRewards = distributedRewards.sub(_amount);
    balances[msg.sender] = balances[msg.sender].add(_amount);
    Transfer(0x0, msg.sender, _amount);
    return true;
  }


  /**
   * @dev Distribute Rewards
   * @param _recipients List of recipients
   * @param _balances Amount to send to recipients
   * TODO this is expensive - better solution:
   * https://github.com/cardstack/merkle-tree-payment-pool
   */
  function distributeRewards(address[] _recipients, uint256[] _balances) onlyOwner public returns(bool) {
    for(uint i = 0; i < _recipients.length; i++){
      require(rewardPool >= _balances[i]);
      rewardPool = rewardPool.sub(_balances[i]);
      balances[_recipients[i]] = balances[_recipients[i]] + _balances[i];
      Transfer(0x0, _recipients[i], _balances[i]);
    }
    return true;
  }

  /**
   * @dev Efficient Distribution
   * @param rewards to be distributed
   */
  function allocateRewards(uint256 rewards) onlyOwner public returns(bool) {
    require(rewards <= rewardPool);
    rewardPool = rewardPool.sub(rewards);
    distributedRewards += rewards;
    return true;
  }

  /**
   * @dev Add tokens to reward pool
   * @param amount rewards to be added to rewardPool
   */
  function addRewards(uint256 amount) onlyOwner public returns(bool) {
    require(amount <= balances[msg.sender]);
    balances[msg.sender] = balances[msg.sender].sub(amount);
    distributedRewards += amount;
    Transfer(owner, 0x0, distributedRewards);
    return true;
  }

  /**
   * @dev converts virtualSupply and virtualPool balance to actual amounts
   * by depositing proportional amount of ether
   */
  function buyVirtualTokens() onlyOwner public payable returns(bool) {
    require(msg.value > 0 && virtualBalance >= msg.value);
    uint256 tokensToConvert = virtualSupply.mul(msg.value).div(virtualBalance);
    msg.sender.transfer(msg.value);
    poolBalance = poolBalance.add(msg.value);
    virtualBalance = virtualBalance.sub(msg.value);
    balances[msg.sender] = balances[msg.sender].add(tokensToConvert);
    virtualSupply = virtualSupply.sub(tokensToConvert);
    Transfer(0x0, owner, tokensToConvert);
    return true;
  }


  /**
   * Disable default mintTokens function
   * @param  _to address to send tokens to
   */
  function mintTokens(address _to) onlyOwner public returns(bool) {
    return false;
  }

  /*
    when we mint new tokens we don't want to move the price of the contract
    because this would create an arbitrage opportunity if we do this at regular intervals
    so we set them aside in the inflationSupply
    its fine to use these tokens because the sale price will take them into account
   */
  function mintRewardTokens() onlyOwner public returns (bool) {
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
   * TODO - what should we do when tokenSupply goes to 0 and inflationSupply makes up the whole token supply?
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
   * TODO - what is more consistent - update totalSupply and adjust buy supply?
   */
  function sell(uint256 sellAmount) public validGasPrice returns(bool) {
    require(sellAmount > 0 && balances[msg.sender] >= sellAmount);
    uint256 tokenSupply = totalSupply_;
    uint256 actualSupply = tokenSupply.add(inflationSupply).sub(virtualSupply);

    require(sellAmount <= actualSupply);

    uint256 actualBalance = poolBalance - virtualBalance;

    /*
      compute sell ratio
      make sure we compute ciel instead of floor! (floor could result in returning more ETH than available in contract)
     */
    uint256 sellReserveRatio246 = reserveRatio * tokenSupply * (10 ** 18) / (tokenSupply + inflationSupply);
    uint32 sellReserveRatio = uint32(((sellReserveRatio246 + (10 ** 18) - 1) / (10 ** 18)));

    // this won't take into account deflation of virtual supply
    // uint256 ethAmount = calculateSaleReturn(tokenSupply + inflationSupply, poolBalance, sellReserveRatio, sellAmount);

    /*
     * This formula will ensure a payout consistent with actual Pool Balance amounts
     */
    uint256 ethAmount = calculateSaleReturn(
      actualSupply,
      actualBalance,
      sellReserveRatio,
      sellAmount
    );
    LogBondingCurve('sellReserveRatio', sellReserveRatio);
    LogBondingCurve('ethAmount', ethAmount);
    LogBondingCurve('this.balance', this.balance);

    msg.sender.transfer(ethAmount);
    poolBalance = poolBalance.sub(ethAmount);
    balances[msg.sender] = balances[msg.sender].sub(sellAmount);
    totalSupply_ = totalSupply_.sub(sellAmount);
    LogWithdraw(sellAmount, ethAmount);
    return true;
  }

  event LogAddress(address value);
  event LogHash(bytes32 value);
}
