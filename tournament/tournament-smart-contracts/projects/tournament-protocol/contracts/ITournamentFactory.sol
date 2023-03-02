pragma solidity ^0.8.0;

contract ITournamentFactory {
    address public feeTo;
    address[] public allTournaments;

    event NewTournament(address indexed tournamentAddress);
}