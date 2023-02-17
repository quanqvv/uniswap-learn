pragma solidity ^0.8.0;

import {Tournament} from "./Tournament.sol";

contract TournamentFactory {
    address public feeTo;
    address[] public allTournaments;

    event NewTournament(address indexed tournamentAddress);

    constructor() {
        owner = msg.sender;
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, 'Tournament: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'Tournament: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }

    function getTournament(uint128 index) public view returns (address){
        return tournaments[index];
    }

    function allTournamentsLength() external view returns (uint) {
        return allTournaments.length;
    }

    function createPublicTournament(address token, uint256 entryFee, uint256 endTime) public returns (address){
        Tournament tournament = new Tournament(msg.sender, true, token, entryFee, endTime);
        emit NewTournament(address(tournament));
        tournaments.push(address(tournament));
        return address(tournament);
    }

    function createPrivateTournament(address token, address entryFee, uint256 endTime, address[] calldata _players) public returns (address) {
        Tournament tournament = new Tournament(address(this), false, address(token), entryFee, endTime);

        for (uint256 i = 0; i < _players.length; i++) {
            tournament.players(_players[i]) = true;
        }
        return address(tournament);
    }
}