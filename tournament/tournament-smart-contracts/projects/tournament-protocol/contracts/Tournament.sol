// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Tournament {
    address public owner;
    uint256 public totalBetAmount;
    uint256 public minimumBetAmount;
    mapping(address => uint256) public bets;

    event NewBet(address indexed player, uint256 betAmount);

    constructor(address _owner, uint256 _minimumBetAmount) {
        owner = _owner;
        minimumBetAmount = _minimumBetAmount;
    }

    function bet() public payable {
        require(msg.value >= minimumBetAmount, "Bet amount is too low");

        bets[msg.sender] += msg.value;
        totalBetAmount += msg.value;

        emit NewBet(msg.sender, msg.value);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw");

        payable(msg.sender).transfer(totalBetAmount);
        totalBetAmount = 0;
    }
}