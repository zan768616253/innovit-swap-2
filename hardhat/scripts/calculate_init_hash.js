const { ethers } = require("hardhat");

async function main() {
  // Replace with your actual pair contract name
  const PairContract = await ethers.getContractFactory("UniswapV2Pair");
  
  // Calculate the init code hash from the bytecode
  const initCodeHash = ethers.keccak256(PairContract.bytecode);
  
  console.log("Init code hash:", initCodeHash);
  console.log("For solidity (without 0x):", initCodeHash.slice(2));
}
  
main().catch((error) => {
  console.error(error);
  process.exit(1);
});