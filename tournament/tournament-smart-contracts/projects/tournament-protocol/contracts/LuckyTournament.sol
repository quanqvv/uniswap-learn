// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20} from "./interfaces/IERC20.sol";
import {ITournamentFactory} from "./ITournamentFactory.sol";
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
    address factory;

    mapping(address => uint256) public playerToNumTicket;
    mapping(address => bool) public hasPlayer;
    mapping(address => bool) public invitedPlayer;
    address[] public players;

    event Deposit(address player, uint256 numTicket);
    event WithdrawDeposit(address player, uint256 numTicket);
    event TournamentWinner(address winner, uint256 prizeValue, uint256 prizeOrder);

    // config
    // totalPrize/10000/100 must be INTEGER; xx/10000 (when calculate protocolFee); xx/100 (when divide prize to winner) ==> minimumPrice >= 10000 * 100
    uint256 public minimumPrice = 10000000; 
    uint256 public numPrize = 2; // 2 
    uint256 public protocolFeeRate = 1; // 0.01% totalPrize
    uint256 public endTourAwardRate = 1; // 0.01% totalPrize
    uint256[] public prizeValueRates = [70, 30]; // firstPrize = 70% totalPrize, secondPrize = 30% totalPrize

    constructor(address _owner, bool _isPublic, address _token, uint256 _ticketPrice, uint256 _endTime){
        require(_ticketPrice >= minimumPrice, "Ticket price is too small");
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

    function invite(address[] calldata _players) public checkEnd{
        require(isPublic == false, "Only invite in private tournament");
        require(owner == msg.sender || factory == msg.sender, "Only the owner can invite");
        for(uint256 i=0; i<_players.length; i++){
            invitedPlayer[_players[i]] = true;
        }
    }

    function join(uint256 numTicket) public checkEnd {
        uint256 ticketValue = numTicket * ticketPrice;
        if (!isPublic) {
            require(invitedPlayer[msg.sender], "You are not invited to this tournament");
        }
        require(token.balanceOf(msg.sender) >= ticketValue, "Insufficient token balance");

        hasPlayer[msg.sender] = true;
        playerToNumTicket[msg.sender] += numTicket;
        totalPrize += ticketValue;
        players.push(msg.sender);

        token.transferFrom(msg.sender, address(this), ticketValue);
        emit Deposit(msg.sender, numTicket);
    }

    function withdrawDeposit(uint256 numTicket) public checkEnd{
        require(hasPlayer[msg.sender], "Not join to the tournament before");
        uint256 requireTicketValue = numTicket * ticketPrice;
        uint256 availableTicketValue = playerToNumTicket[msg.sender] * ticketPrice;
        require(requireTicketValue <= availableTicketValue, "withdraw over available tickets");

        playerToNumTicket[msg.sender] -= numTicket;
        totalPrize -= requireTicketValue;
        if(requireTicketValue == availableTicketValue){
            hasPlayer[msg.sender] = false;
        }

        uint256 i = 0;
        for(uint256 ticket; ticket < numTicket; ticket++){
            for(; i<players.length; i++){
                if(players[i] == msg.sender){
                    // Array only delete element (last element) via pop. So, will assign last element to i for keeping last element, then delete last element
                    if(i < players.length - 1){
                        players[i] = players[players.length - 1];
                    }
                    players.pop();
                    break;
                }
            }
        }

        token.transfer(msg.sender, requireTicketValue);
        emit WithdrawDeposit(msg.sender, numTicket);
    }

    function end() public{
        if(!checkEndTime()){
            require(msg.sender == owner, "Only the owner can end the tournament before end time");
        }else{
            require(hasPlayer[msg.sender], "Only player in this tournament can end");
        }

        require(totalPrize > 0, "No players joined the tournament");

        // save to local for avoid access contract state
        uint256 numPlayer = players.length;
        uint256 _totalPrize = totalPrize;

        uint256 protocolFee = _totalPrize * protocolFeeRate / 10000;
        uint256 endTourAward = _totalPrize * endTourAwardRate / 10000;
        uint256 nonFeeTotalPrize = _totalPrize - protocolFee - endTourAward;

        token.transfer(ITournamentFactory(factory).feeTo(), protocolFee);
        token.transfer(msg.sender, endTourAward);

        uint256[] memory randomNumbers = RandomSupporter.getRandomNumbers(numPrize, numPlayer);
        for(uint256 prizeOrder=0; prizeOrder < numPrize; prizeOrder++){
            uint256 winnerIndex = randomNumbers[prizeOrder];
            address winner = players[winnerIndex];
            uint256 prizeValue = nonFeeTotalPrize * prizeValueRates[prizeOrder] / 100;
            token.transfer(winner, prizeValue);
            emit TournamentWinner(winner, prizeValue, prizeOrder + 1);
        }
        isEnd = true;
    }
}