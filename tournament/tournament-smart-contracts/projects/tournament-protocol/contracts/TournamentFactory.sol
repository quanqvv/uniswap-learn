// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Tournament} from "./Tournament.sol";

contract TournamentFactory {
    address[] public bettingTables;

    function createBettingTable(uint256 minimumBetAmount) public {
        address bettingTable = address(new Tournament(msg.sender, minimumBetAmount));
        bettingTables.push(bettingTable);
    }

    function getBettingTables() public view returns (address[] memory) {
        return bettingTables;
    }
}