// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20} from "./interfaces/IERC20.sol";

contract Tournament {
    address public owner;
    uint256 public entryFee;
    uint256 public totalPot;
    uint256 public endTime;
    IERC20 public token;
    bool public isPublic;
    string public tournamentName;
    bool public isEnd = false;
    address factory;

    mapping(address => uint256) public playerBets;
    mapping(address => bool) public hasPlayer;
    mapping(address => bool) public invitedPlayer;
    address[] public players;

    event NewPlayer(address indexed player, uint256 betAmount);
    event TournamentEnded(address winner, uint256 prize);

    constructor(address _owner, bool _isPublic, address _token, uint256 _entryFee, uint256 _endTime){
        factory = msg.sender;
        owner = _owner;
        entryFee = _entryFee;
        token = IERC20(_token);
        isPublic = _isPublic;
        endTime = block.timestamp + _endTime; // Set tournament end time to 1 hour from now
        if(isPublic){
            invitedPlayer[_owner] = true;
        }
    }

    function temp() external view returns (uint a1, uint a2){
        a1 = block.timestamp;
        a2 = endTime;
    }

    modifier checkEnd{
        require(block.timestamp < endTime || isEnd == true, "Tournament has ended");
        _;
    }

    function checkEndTime() public view returns (bool isEndTime){
        isEndTime = block.timestamp >= endTime;
    }

    function invite(address[] calldata invitedPlayers) public{
        require(isPublic == false, "Only invite in private tournament");
        require(msg.sender == owner || msg.sender == factory, "Only the owner can invite");
        for(uint256 i=0; i<invitedPlayers.length; i++){
            invitedPlayer[invitedPlayers[i]] = true;
        }
    }


    function join() public checkEnd {
        if (!isPublic) {
            require(invitedPlayer[msg.sender], "You are not invited to this tournament");
        }
        require(playerBets[msg.sender] == 0, "You have already placed a bet in this tournament");
        require(token.balanceOf(msg.sender) >= entryFee, "Insufficient token balance");

        hasPlayer[msg.sender] = true;
        playerBets[msg.sender] += entryFee;
        totalPot += entryFee;
        players.push(msg.sender);

        token.transferFrom(msg.sender, address(this), entryFee);

        emit NewPlayer(msg.sender, entryFee);
    }

    function end() public {
        if(checkEndTime() == false){
            require(msg.sender == owner, "Only the owner can end the tournament before end time");
        }else{
            require(hasPlayer[msg.sender], "Only player in this tournament can end");
        }

        require(totalPot > 0, "No players joined the tournament");

        address[] memory playerAddresses = new address[](players.length);
        uint256[] memory playerBetsArray = new uint256[](players.length);

        uint256 totalBets;
        uint256 index = 0;

        for (uint256 i = 0; i < players.length; i++) {
            if (playerBets[players[i]] > 0) {
                playerAddresses[index] = players[i];
                playerBetsArray[index] = playerBets[players[i]];
                totalBets += playerBets[players[i]];
                index++;
            }
        }

        require(totalBets > 0, "No players have placed bets");

        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, totalBets)));
        uint256 winningIndex = randomValue % index;
        address winner = playerAddresses[winningIndex];

        token.transfer(winner, totalPot);
        totalPot = 0;
        isEnd = true;

        emit TournamentEnded(winner, totalPot);
    }
}