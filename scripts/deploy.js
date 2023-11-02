const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.getContractFactory("Tasks");
  const contractOnChain = await contract.deploy();
  await contractOnChain.deployed();

  console.log("Contract deployed to:", contractOnChain.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
