import { ethers, network, run } from "hardhat";
import config from "../config";

import _Web3 from "web3"
// import Txa from "web3"
const Web3 = require("web3")

const web3: _Web3 = new Web3("http://127.0.0.1:7545")


const main = async () => {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  // Sanity checks
  if (networkName === "mainnet") {
    console.log("testtest")
    if (!process.env.KEY_MAINNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  } else if (networkName === "testnet") {
    if (!process.env.KEY_TESTNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  }

  if (!config.PancakeRouter[networkName] || config.PancakeRouter[networkName] === ethers.constants.AddressZero) {
    throw new Error("Missing router address, refer to README 'Deployment' section");
  }

  if (!config.WBNB[networkName] || config.WBNB[networkName] === ethers.constants.AddressZero) {
    throw new Error("Missing WBNB address, refer to README 'Deployment' section");
  }

  console.log("Deploying to network:", networkName);

  // Deploy PancakeZapV1
  // console.log("Deploying PancakeZap V1..");
  // const PancakeZapV1 = await ethers.getContractFactory("PancakeZapV1");
  // const pancakeZap = await PancakeZapV1.deploy(
  //   config.WBNB[networkName],
  //   config.PancakeRouter[networkName],
  //   config.MaxZapReverseRatio[networkName]
  // );
  // await pancakeZap.deployed();
  // console.log("PancakeZap V1 deployed to:", pancakeZap.address);

  async function deployToken0(){
    console.log("Deploying Token0..");
    const TokenTest0 = await ethers.getContractFactory("TokenTest0");
    const tokenTest0 = await TokenTest0.deploy();
    await tokenTest0.deployed();
    console.log("TokenTest0 deployed to:", tokenTest0.address)
  }

  async function deployToken1() {
    console.log("Deploying Token1..");
    const TokenTest1 = await ethers.getContractFactory("TokenTest1");
    const tokenTest1 = await TokenTest1.deploy();
    await tokenTest1.deployed();
    console.log("TokenTest1 deployed to:", tokenTest1.address)
  }

  async function deployFactory(){
    console.log("Deploying PancakeFactory..");
    const PancakeFactory = await ethers.getContractFactory("PancakeFactory");
    const pancakeFactory = await PancakeFactory.deploy("0xaf8E1c8C7624aB58c0eE7F22Fd242A0ba1B0043E");
    await pancakeFactory.deployed();
    console.log("PancakeFactory deployed to:", pancakeFactory.address)
  }

  // async function deployRouter() {
  //   console.log("Deploying PancakeRouter..");
  //   const PancakeRouter = await ethers.getContractFactory("PancakeRouter");
  //   const pancakeRouter = await PancakeRouter.deploy(pancakeFactory.address, tokenTest0.address);
  //   await pancakeRouter.deployed();
  //   console.log("PancakeRouter deployed to:", pancakeRouter.address)
  // }

  async function deployRouter2() {
    console.log("Deploying PancakeRouter..");
    const PancakeRouter = await ethers.getContractFactory("PancakeRouter");
    const pancakeRouter = await PancakeRouter.deploy(
      "0x1E8F438a1F0E5a94B148Fe016f7425ff3C20bf61", 
      "0x25ba296755eb1CC17134e8F93f12b4A8C0330622");
    await pancakeRouter.deployed();
    console.log("PancakeRouter deployed to:", pancakeRouter.address)
  }

  async function deployRouter3() {
    const mainAccount = "0xaf8E1c8C7624aB58c0eE7F22Fd242A0ba1B0043E"
    const token0 = "0x25ba296755eb1CC17134e8F93f12b4A8C0330622"
    const token1 = "0x746c373d5Ad6c49E91749E6bCa45e1D3B22c6C70"
    const factory = "0x1E8F438a1F0E5a94B148Fe016f7425ff3C20bf61"
    const weth = "0x7a9644B7eA39725800C9BBf1F6C6b12411f95728"

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

  async function deployWETH() {
    console.log("Deploying WETH..");
    const WETH = await ethers.getContractFactory("WETH");
    const weth = await WETH.deploy();
    await weth.deployed();
    console.log("WETH deployed to:", weth.address)
  }
  

  await deployToken0()
  await deployToken1()
  // await deployFactory()
  // await deployRouter3()
  // await deployWETH()











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
