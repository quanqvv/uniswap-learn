pragma solidity ^0.8.0;

contract ITournament{
    function join() public;
    function end() public;
    function isEnd() external pure returns (string memory);
}