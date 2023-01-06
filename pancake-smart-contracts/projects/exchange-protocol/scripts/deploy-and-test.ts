import { artifacts, ethers, network, run } from "hardhat";
import config from "../config";
import { assert, expect, use } from "chai";
import _Web3 from "web3"
import { parseEther } from "ethers/lib/utils";
import { BN, constants, expectEvent, expectRevert, time } from "@openzeppelin/test-helpers";


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
const PancakeFactory = artifacts.require("./PancakeFactory.sol");
const PancakePair = artifacts.require("./PancakePair.sol");
const PancakeRouter = artifacts.require("./PancakeRouter.sol");
const PancakeZapV1 = artifacts.require("./PancakeZapV1.sol");
const WBNB = artifacts.require("./WBNB.sol");

const users = [acc1, acc2, acc3]



const main = async () => {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");
  const networkName = network.name;
  console.log("Deploying to network:", networkName);

  console.log("PancakeFactory...");
  const pancakeFactory = await PancakeFactory.at(factory)
  console.log("PancakeFactory deployed to:", pancakeFactory.address)
  console.log("NUM LPs", (await pancakeFactory.allPairsLength()).words[0])

// console.log(await (await PancakeFactory.at(factory)).allPairsLength())

console.log("Deploying Token");
const MockERC20 = artifacts.require("./utils/MockERC20.sol");
const tokenA = await MockERC20.new("Token A", "TA", parseEther("10000000"), { from: acc1 });
const tokenC = await MockERC20.new("Token C", "TC", parseEther("10000000"), { from: acc1 });
const wrappedBNB = await WBNB.new({ from: acc1 });
console.log("Token A deployed to", tokenA.address);
console.log("Token WBNB deployed to", wrappedBNB.address);
console.log("Token C deployed to", tokenC.address);

console.log("Deploying PancakeRouter..");
const PancakeRouter = await ethers.getContractFactory("PancakeRouter");
const pancakeRouter = await PancakeRouter.deploy(factory, wrappedBNB.address);
await pancakeRouter.deployed();
console.log("PancakeRouter deployed to:", pancakeRouter.address)

console.log("Create 3 LP tokens")
let result = await pancakeFactory.createPair(tokenA.address, wrappedBNB.address, {from: acc1})
let pairAB = await PancakePair.at(result.logs[0].args[2])

result = await pancakeFactory.createPair(wrappedBNB.address, tokenC.address, {from: acc1})
let pairBC = await PancakePair.at(result.logs[0].args[2])

result = await pancakeFactory.createPair(tokenA.address, tokenC.address, {from: acc1})
let pairAC = await PancakePair.at(result.logs[0].args[2])

console.log("Mint and approve all contracts")
for(let user of users){
    for(let token of [tokenA, tokenC]){
        await token.mintTokens(parseEther("2000000"), {from: user})
        // assert.equal(String(await token.balanceOf(user)), parseEther("2000000").toString());
    }

    for(let token of [tokenA, wrappedBNB, tokenC, pairAB, pairBC, pairAC]){
        await token.approve(pancakeRouter.address, constants.MAX_UINT256, {from: user})
    }
}

console.log("Add liquidity...")
let testAccount = acc1
const deadline = Math.floor(Date.now() / 1000) + 60 * 10
// 1 A = 1 C
result = await pancakeRouter.addLiquidity(
  tokenC.address,
  tokenA.address,
  parseEther("1000000"), // 1M token A
  parseEther("1000000"), // 1M token B
  parseEther("1000000"),
  parseEther("1000000"),
  testAccount,
  deadline,
  { from: testAccount }
);

console.log(result)

expectEvent.inTransaction(result.hash, tokenA, "Transfer", {
  from: testAccount,
  to: pairAC.address,
  value: parseEther("1000000").toString(),
});

expectEvent.inTransaction(result.hash, tokenC, "Transfer", {
  from: testAccount,
  to: pairAC.address,
  value: parseEther("1000000").toString(),
});

assert.equal(String(await pairAC.totalSupply()), parseEther("1000000").toString());
assert.equal(String(await tokenA.balanceOf(pairAC.address)), parseEther("1000000").toString());
assert.equal(String(await tokenC.balanceOf(pairAC.address)), parseEther("1000000").toString());

pancakeRouter.swap()

// // 1 BNB = 100 A
// result = await pancakeRouter.addLiquidityETH(
//   tokenA.address,
//   parseEther("100000"), // 100k token A
//   parseEther("100000"), // 100k token A
//   parseEther("1000"), // 1,000 BNB
//   testAccount,
//   deadline,
//   { from: testAccount, value: parseEther("1000").toString() }
// );

// expectEvent.inTransaction(result.hash, tokenA, "Transfer", {
//   from: testAccount,
//   to: pairAB.address,
//   value: parseEther("100000").toString(),
// });

// assert.equal(String(await pairAB.totalSupply()), parseEther("10000").toString());
// assert.equal(String(await wrappedBNB.balanceOf(pairAB.address)), parseEther("1000").toString());
// assert.equal(String(await tokenA.balanceOf(pairAB.address)), parseEther("100000").toString());

// // 1 BNB = 100 C
// result = await pancakeRouter.addLiquidityETH(
//   tokenC.address,
//   parseEther("100000"), // 100k token C
//   parseEther("100000"), // 100k token C
//   parseEther("1000"), // 1,000 BNB
//   testAccount,
//   deadline,
//   { from: testAccount, value: parseEther("1000").toString() }
// );

// expectEvent.inTransaction(result.hash, tokenC, "Transfer", {
//   from: testAccount,
//   to: pairBC.address,
//   value: parseEther("100000").toString(),
// });

// assert.equal(String(await pairBC.totalSupply()), parseEther("10000").toString());
// assert.equal(String(await wrappedBNB.balanceOf(pairBC.address)), parseEther("1000").toString());
// assert.equal(String(await tokenC.balanceOf(pairBC.address)), parseEther("100000").toString());

return

  console.log("Deploying Token0..");
  const TokenTest0 = await ethers.getContractFactory("TokenTest0");
  const tokenTest0 = await TokenTest0.deploy();
  await tokenTest0.deployed();
  console.log("TokenTest0 deployed to:", tokenTest0.address)

  console.log("Deploying Token1..");
  const TokenTest1 = await ethers.getContractFactory("TokenTest1");
  const tokenTest1 = await TokenTest1.deploy();
  await tokenTest1.deployed();
  console.log("TokenTest1 deployed to:", tokenTest1.address)


  async function deployRouter3() {

    console.log("Deploying PancakeRouter..");
    const PancakeRouter = await ethers.getContractFactory("PancakeRouter");
    const pancakeRouter = await PancakeRouter.deploy(
      factory, 
      weth
      );
    await pancakeRouter.deployed();
    console.log("PancakeRouter deployed to:", pancakeRouter.address)
    console.log(await pancakeRouter.functions.addLiquidity(token0, token1, 1,1,1,1, mainAccount, 100000000000));
    // console.log(await pancakeRouter.functions.testFunc22(factory, token0, token1));
    // console.log(await pancakeRouter.functions.testFunc())
    // console.log("PancakeRouter deployed to:", pancakeRouter)
    // console.log("PancakeRouter deployed to:", pancakeRouter)
  }











    // // Deploy PancakeRouter
    // console.log("Deploying PancakeRouter..");

    // const PancakeRouter = await ethers.getContractFactory("PancakeRouter");
  
    // const pancakeRouter = await PancakeRouter.deploy(
    //   config.WBNB[networkName],
    //   config.PancakeRouter[networkName],
    //   config.MaxZapReverseRatio[networkName]
    // );
  
    // await pancakeRouter.deployed();

    // console.log("PancakeRouter V1 deployed to:", pancakeRouter.address);

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
