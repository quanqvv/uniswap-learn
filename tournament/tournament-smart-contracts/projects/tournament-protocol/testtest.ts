import _Web3 from "web3"
// import Txa from "web3"
const Web3 = require("web3")

const web3: _Web3 = new Web3("http://127.0.0.1:7545")

let pancakeRouterABI = require("./build/PancakeRouter.json");
let pancakePairABI = require("./build/PancakePair.json");
const ERC20ABI = require("./build/PancakePair.json");

const mainAccount = "0xaf8E1c8C7624aB58c0eE7F22Fd242A0ba1B0043E"
const privateMainAccount = "717e4a1532fa670b72d8c55913bcde48f06fd09697ebedd8268f2a08a15a3ebb"

const mainAccount2 = "0x7409F24e74278d1608910f5CC61D70ECFb5EE661"
const privateMainAccount2 = "9fb2b583b4af2cffe76a81ff98c1987b5c8a243f804d7682ef0d4e4f0ff8c64b"


const token0 = "0x25ba296755eb1CC17134e8F93f12b4A8C0330622"
const token1 = "0x746c373d5Ad6c49E91749E6bCa45e1D3B22c6C70"
const factory = "0x1E8F438a1F0E5a94B148Fe016f7425ff3C20bf61"
const router = "0x8a449D7760139586467F3d7A952F47427Bae6A3E"


// var pancakeRouter = new web3.eth.Contract(pancakeRouterABI, router, {from: mainAccount})
// pancakeRouter.methods.addLiquidity(token0, token1, 1005,1000,1005,1000, mainAccount, 100000000000).call().then((value: any) => console.log(value))

// var pancakePair = new web3.eth.Contract(pancakePairABI, "0x3E793B1a6fdC9Ff56fC462EFAccd99804f0E607B", {from: mainAccount})
// pancakePair.methods.getReserves().call().then((value: any) => console.log(value))

const tokenTest0 = new web3.eth.Contract(ERC20ABI, token0, {from: mainAccount})
tokenTest0.methods.balanceOf(mainAccount).call().then((value: any) => console.log(value))
// tokenTest0.methods.approve(mainAccount2, 1000).call().then((value: any) => console.log(value))
tokenTest0.methods.transfer(mainAccount2, 1000).call().then((value: any) => console.log(value))