const ethers = require("ethers");

module.exports = {
    environment: "development",
    databasefile: "data/reststore",
    authenticatedaccounts: ["0x00"],
    ipfshost: { host: 'ipfs.web3.party', port: 5001, protocol: 'https' },
    ethers: {
        jsonproviderurl: "https://infura.io/U8U4n8mm2wDgB2e3Dksv",
        chainId: ethers.utils.getNetwork('homestead').chainId
    }
};
