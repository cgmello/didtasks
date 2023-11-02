require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/4b4d5e12505f4248ab2ba918fdcec22c",
      accounts: [`0x${process.env.PRIVATEKEY}`]
    }
  }
};
