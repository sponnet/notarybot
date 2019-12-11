const ethers = require("ethers");

module.exports = {
    environment: "development",
    databasefile: "data/reststore",
    authenticatedaccounts: ["0x00"],
    ipfshost: { host: '23.254.227.151', port: 5001, protocol: 'http' },
    ethers: {
        jsonproviderurl: "https://ropsten.infura.io/U8U4n8mm2wDgB2e3Dksv",
        chainId: ethers.utils.getNetwork('ropsten').chainId
    }
};
