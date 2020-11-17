const ethers = require("ethers");

module.exports = {
    environment: "development",
    databasefile: "data/reststore",
    authenticatedaccounts: ["0x00"],
    ipfshost: { host: '80.208.229.228', port: 5001, protocol: 'http' },
    ethers: {
        jsonproviderurl: "https://ropsten.infura.io/v3/766661aa3a1e414584b9d2c2b73e6930",
        chainId: ethers.utils.getNetwork('ropsten').chainId
    }
};
