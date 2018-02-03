pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/RelevantCoin.sol";

contract TestRelevantCoin {

  event Log(string logString, uint value);
  event LogAddr(string logString, address addr);
  event LogB(string logString, bool value);

  function testInitialBalanceWithNewRelevantCoin() public {
    RelevantCoin meta = new RelevantCoin();

    meta.transferOwnership(msg.sender);
    address owner = meta.owner();
    LogAddr("msg sender", msg.sender);
    LogAddr("owner", owner);
    LogAddr("contract", address(this));

    uint lastInflationUpdate = meta.intervalsSinceLastInflationUpdate();

    uint expected = 0 * (10 ** 18);
    // uint expected = 10000 * (10 ** 18);

    Assert.equal(meta.balanceOf(msg.sender), expected, "Owner should have 10000 coins initially");
    Assert.equal(owner, msg.sender, "Owner should be person originating the contract");
    Assert.equal(lastInflationUpdate, 0, "Last update for brand new contract should be 0 hours ago");
  }

  // function testDeployedContractInflatoin() public {
  //   RelevantCoin meta = RelevantCoin(DeployedAddresses.RelevantCoin());

  //   address owner = meta.owner();

  //   uint hoursElapsed = meta.getHoursSinceLastInflationUpdate();

  //   Log("hoursElapsed", hoursElapsed);

  //   bool r = false;
  //   // r = meta.inflation(owner);
  //   // LogB("r", r);


  //   // if (hoursElapsed == 0) {
  //   //   Assert.isTrue(r, "Should throw exception if hoursElapsed is true");
  //   // } else {
  //   //   Assert.isTrue(r, "Should be true if hoursElapsed is > 0");
  //   // }

  //   uint expected = 10000;

  //   Assert.equal(meta.balanceOf(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  // }


}
