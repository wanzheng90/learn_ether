require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.34",
  paths: {
    sources: "./contract",
    tests: "./test",
  },
};
