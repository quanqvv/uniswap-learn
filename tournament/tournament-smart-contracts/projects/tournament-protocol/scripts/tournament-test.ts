import { artifacts, ethers, network, run } from "hardhat";
import config from "../config";
import { assert, expect, use } from "chai";
import _Web3 from "web3"
import { parseEther } from "ethers/lib/utils";
import { BN, constants, expectEvent, expectRevert, time } from "@openzeppelin/test-helpers";
import { Console } from "console";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";


// import Txa from "web3"
const Web3 = require("web3")

const web3: _Web3 = new Web3("http://127.0.0.1:7545")

const mainAccount = "0xaf8E1c8C7624aB58c0eE7F22Fd242A0ba1B0043E"
const acc1 = mainAccount
const acc2 = "0x7409F24e74278d1608910f5CC61D70ECFb5EE661"
const acc3 = "0xF83a67BA6cA61B6939c564ac744D75297a8025E4"
const token0 = "0x25ba296755eb1CC17134e8F93f12b4A8C0330622"
const token1 = "0x746c373d5Ad6c49E91749E6bCa45e1D3B22c6C70"
const factory = "0x1E8F438a1F0E5a94B148Fe016f7425ff3C20bf61"
const weth = "0x7a9644B7eA39725800C9BBf1F6C6b12411f95728"

const MockERC20 = artifacts.require("./utils/MockERC20.sol");
const TournamentFactory = artifacts.require("./TournamentFactory.sol");
const Tournament = artifacts.require("./Tournament.sol");

const users = [acc1, acc2, acc3]


const main = async () => {
    // Compile contracts
    await run("compile");
    console.log("Compiled contracts.");
    const networkName = network.name;
    console.log("Deploying to network:", networkName);
  
    console.log("TournamentFactory...");
    const TournamentFactory = await ethers.getContractFactory("TournamentFactory");
    const tournamentFactory = await TournamentFactory.deploy()
    await tournamentFactory.deployed()
    console.log("TournamentFactory deployed to:", tournamentFactory.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
