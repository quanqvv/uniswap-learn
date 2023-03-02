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
const WBNB = artifacts.require("./WBNB.sol");

const users = [acc1, acc2, acc3]

async function showBalance(address, token, msg=""){
  const tokenSymbol = await token.symbol()
  console.log(`${msg} Balance token ${tokenSymbol} of address ${address} is ${await token.balanceOf(address)}`)
}


const main = async () => {
    // Compile contracts
    await run("compile");
    console.log("Compiled contracts.");
    const networkName = network.name;
    console.log("Deploying to network:", networkName);

    console.log("Deploying Token");
    const MockERC20 = artifacts.require("./utils/MockERC20.sol");
    const tokenA = await MockERC20.new("Token A", "TA", parseEther("0"), { from: acc1 });
    const tokenC = await MockERC20.new("Token C", "TC", parseEther("10000000"), { from: acc1 });
    const wrappedBNB = await WBNB.new({ from: acc1 });
    console.log("Token A deployed to", tokenA.address);
    // console.log("Token WBNB deployed to", wrappedBNB.address);
    // console.log("Token C deployed to", tokenC.address);

  
    console.log("Deploy TournamentFactory...");
    const tournamentFactory = await TournamentFactory.new()
    console.log("TournamentFactory deployed at:", tournamentFactory.address)

    async function createPublicTournament({tokenAddress, entryFee, endTime}) {
      console.log("Deploy Public Tournament...");
      var transaction = await tournamentFactory.createPublicTournament(tokenAddress, entryFee, endTime)
      const tournament = await Tournament.at(transaction.receipt.logs[0].args.tournamentAddress)
      console.log("Tournament deployed at:", tournament.address)
      return tournament
    }

    async function createPrivateTournament({tokenAddress, entryFee, endTime, invitedPlayer}) {
      console.log("Deploy Private Tournament...");
      var transaction = await tournamentFactory.createPrivateTournament(tokenAddress, entryFee, endTime, invitedPlayer)
      const tournament = await Tournament.at(transaction.receipt.logs[0].args.tournamentAddress)
      console.log("Tournament deployed at:", tournament.address)
      return tournament
    }


    async function mintTokenAndAllowToTournamentContract(tournament){
      console.log("Mint and approve all contracts")
      for(let user of users){
          for(let token of [tokenA]){
              await token.mintTokens(parseEther("2000000"), {from: user})
              // assert.equal(String(await token.balanceOf(user)), parseEther("2000000").toString());
          }
  
          for(let token of [tokenA]){
              await token.approve(tournament.address, constants.MAX_UINT256, {from: user})
          }
      }
    }



    // console.log("\n**Public tournament info**")
    // var tournament = await createPublicTournament({tokenAddress: tokenA.address, entryFee: 100, endTime: 1000})
    // await mintTokenAndAllowToTournamentContract(tournament)
    // console.log("Owner " + await tournament.owner())

    // await showBalance(acc1, tokenA, "Before join tour");
    // await tournament.join()
    // await showBalance(acc1, tokenA, "After join tour");

    // await showBalance(acc2, tokenA, "Before join tour");
    // await tournament.join({ from: acc2 })
    // await showBalance(acc2, tokenA, "After join tour");

    // console.log("Player " + await tournament.players(0))
    // console.log("Player " + await tournament.players(1))

    // await tournament.end({from: acc1})
    // await showBalance(acc1, tokenA, "After end tour");
    // await showBalance(acc2, tokenA, "After end tour");


    console.log("\n**Private tournament info**")
    var endTimeDuration = 5
    var tournament = await createPrivateTournament({tokenAddress: tokenA.address, entryFee: 100, endTime: endTimeDuration, invitedPlayer: [acc1, acc2]})
    await mintTokenAndAllowToTournamentContract(tournament)
    console.log("Owner " + await tournament.owner())

    // show blocktimestamp and endtime console.log("test", (await tournament.temp())["0"].toString(), (await tournament.temp())["1"].toString())

    await showBalance(acc1, tokenA, "Before join tour");
    await tournament.join()
    await showBalance(acc1, tokenA, "After join tour");

    await showBalance(acc2, tokenA, "Before join tour");
    await tournament.join({ from: acc2 })
    await showBalance(acc2, tokenA, "After join tour");
    
    await tournament.invite([acc3], {from: acc1})

    await showBalance(acc3, tokenA, "Before join tour");
    await tournament.join({ from: acc3 })
    await showBalance(acc3, tokenA, "After join tour");

    // console.log("Player " + await tournament.players(0))
    // console.log("Player " + await tournament.players(1))
    // console.log("Player " + await tournament.players(2))

    // check endtime condition
    const afterEndTime = (endTimeDuration + 2)  * 1000;
    const beforeEndTime = 0
    await new Promise(r => setTimeout(r, afterEndTime));

    await tournament.end({from: acc2})
    await showBalance(acc1, tokenA, "After end tour");
    await showBalance(acc2, tokenA, "After end tour");
    await showBalance(acc3, tokenA, "After end tour");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
