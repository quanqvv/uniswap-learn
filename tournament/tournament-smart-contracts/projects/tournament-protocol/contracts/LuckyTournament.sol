// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20} from "./interfaces/IERC20.sol";
import {RandomSupporter} from "./libraries/RandomSupporter.sol";

contract LuckyTournament {
    address public owner;
    uint256 public ticketPrice;
    uint256 public totalPrize;
    uint256 public endTime;
    IERC20 public token;
    bool public isPublic;
    string public tournamentName;
    bool public isEnd = false;

    mapping(address => uint256) public playerToNumTicket;
    mapping(address => bool) public hasPlayer;
    mapping(address => bool) public invitedPlayer;
    address[] public players;

    event Deposit(address indexed player, uint256 num);
    event TournamentEnded(address indexed winner, uint256 prize);
    event CancelDeposit(address indexed player, uint256 numTiket);

    constructor(address _owner, bool _isPublic, address _token, uint256 _ticketPrice, uint256 _endTime){
        factory = msg.sender;
        owner = _owner;
        ticketPrice = _ticketPrice;
        token = IERC20(_token);
        isPublic = _isPublic;
        endTime = block.timestamp + _endTime; // Set tournament end time to 1 hour from now
        if(isPublic){
            invitedPlayer[_owner] = true;
        }
    }

    modifier checkEnd{
        require(block.timestamp < endTime || isEnd == true, "Tournament has ended");
        _;
    }

    modifier onlyOwner{
        require(msg.sender != owner, "Only owner");
        _;
    }

    function checkEndTime() public view returns (bool isEndTime){
        isEndTime = block.timestamp < endTime;
    }

    function invite(address[] _players){
        require(isPublic == false, "Only invite in private tournament");
        require(owner == msg.sender, "Only the owner can invite");
        for(uinit256 i=0; i<_players.length; i++){
            invitedPlayer[_players[i]] = true;
        }
    }

    function join(uint256 numTicket) public checkEnd {
        if (!isPublic) {
            require(invitedPlayer[msg.sender], "You are not invited to this tournament");
        }
        require(token.balanceOf(msg.sender) >= ticketPrice, "Insufficient token balance");

        hasPlayer[msg.sender] = true;
        playerToNumTicket[msg.sender] += numTicket;
        totalPrize += (numTicket * ticketPrice);
        players.push(msg.sender);

        token.transferFrom(msg.sender, address(this), ticketPrice);

        emit Deposit(msg.sender, );
    }

    function cancelDeposit() public {
        token.transferFrom(this, msg.sender, ticketPrice);
    }

    function end() public {
        if(!checkEndTime()){
            require(msg.sender == owner, "Only the owner can end the tournament before end time");
        }else{
            require(hasPlayer[msg.sender], "Only player in this tournament can end");
        }

        require(totalPrize > 0, "No players joined the tournament");

        uint256 numPlayer = players.length;
        uint256 totalPrize = totalPrize;

        uint120 numPrize = 2;
        uint256 prizeValue = new 
        uint256 memory randomNumbers = RandomSupporter.getRandomNumbers(numPrize, numPlayer);
        for(uint256 i=0; i < numPrize; i++){
            uint256 firstWinnerIndex = randomNumbes[i];
            
        }

        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, play)));
        uint256 winningFirstPrizeIndex = randomValue % index;
        address winnerFistPrize = playerAddresses[winningFirstPrizeIndex];

        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, play)));
        uint256 winningFirstPrizeIndex = randomValue % index;
        address winnerFistPrize = playerAddresses[winningFirstPrizeIndex];

        token.transfer(winner, totalPrize);
        totalPrize = 0;

        emit TournamentEnded(winner, totalPrize);
    }
}