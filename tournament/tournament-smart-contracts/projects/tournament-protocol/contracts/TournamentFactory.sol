pragma solidity ^0.8.0;

import "./Tournament.sol";

contract TournamentFactory {
    address public owner;

    event NewTournament(address indexed tournamentAddress);

    constructor(address _owner) {
        owner = _owner;
        entryFee = _entryFee;
        token = IERC20(_token);
    }

    function createPublicTournament(address token, address entryFee, uint256 endTime) public {
        Tournament tournament = new Tournament(msg.sender, true, entryFee, address(token), entryFee);
        emit NewTournament(address(tournament));
    }

    function createPrivateTournament(address token, address entryFee, uint256 endTime, address[] calldata _players) public {
        Tournament tournament = new Tournament(msg.sender, false, address(token), entryFee, endTime);

        for (uint256 i = 0; i < _players.length; i++) {
            tournament.players(_players[i]) = true
        }
    }
}