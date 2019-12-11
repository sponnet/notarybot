const ethers = require("ethers");
module.exports = {
    apiurl: "http://localhost:5005",
    ipfshost: { host: '<IPFS.HOST>', port: 5001, protocol: 'http' },
    ethers: {
        privateKey: "<PRIVATE KEY>",
        jsonproviderurl: "https://ropsten.infura.io/<INFURA KEY>",
        chainId: ethers.utils.getNetwork('ropsten').chainId
    }
}

