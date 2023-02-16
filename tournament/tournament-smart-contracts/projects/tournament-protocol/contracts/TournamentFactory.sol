pragma solidity ^0.8.0;

import {Tournament} from "./Tournament.sol";

contract TournamentFactory {
    address public owner;

    event NewTournament(address indexed tournamentAddress);

    constructor(address _owner) {
        owner = _owner;
    }

    function createPublicTournament(address token, uint256 entryFee, uint256 endTime) public returns (address){
        Tournament tournament = new Tournament(msg.sender, true, token, entryFee, endTime);
        emit NewTournament(address(tournament));
        return address(tournament);
    }

    // function createPrivateTournament(address token, address entryFee, uint256 endTime, address[] calldata _players) public returns (address) {
    //     Tournament tournament = new Tournament(msg.sender, false, address(token), entryFee, endTime);

    //     for (uint256 i = 0; i < _players.length; i++) {
    //         tournament.players(_players[i]) = true;
    //     }
    //     return address(tournament);
    // }
}