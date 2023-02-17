pragma solidity ^0.8.0;

interface ITournament{
    function join() external;
    function end() external;
    function isEnd() external pure returns (string memory);
}