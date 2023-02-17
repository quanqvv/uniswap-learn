pragma solidity ^0.8.0;

import {Tournament} from "./Tournament.sol";

contract TournamentFactory {
    address public feeTo;
    address[] public allTournaments;

    event NewTournament(address indexed tournamentAddress);

    constructor() {
        feeTo = msg.sender;
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeTo, 'Tournament: FORBIDDEN');
        feeTo = _feeTo;
    }

    function getTournament(uint128 index) public view returns (address){
        return allTournaments[index];
    }

    function allTournamentsLength() external view returns (uint) {
        return allTournaments.length;
    }

    function createPublicTournament(address token, uint256 entryFee, uint256 endTime) external returns (address){
        Tournament tournament = new Tournament(msg.sender, true, token, entryFee, endTime);
        emit NewTournament(address(tournament));
        address tournamentAddress = address(tournament);
        allTournaments.push(tournamentAddress);
        return address(tournament);
    }

    function createPrivateTournament(address token, uint256 entryFee, uint256 endTime, address[] calldata invitedPlayers) external returns (address) {
        Tournament tournament = new Tournament(msg.sender, false, token, entryFee, endTime);
        emit NewTournament(address(tournament));
        tournament.invite(invitedPlayers);
        return address(tournament);
    }
}