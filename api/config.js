const ethers = require("ethers");

const configs = {
    dev: {
        environment: "development",
        databasefile: "data/reststore",
        authenticatedaccounts: ["0x00"],
        ipfshost: { host: '23.254.227.151', port: 5001, protocol: 'http' },
        ethers: {
            jsonproviderurl: "https://ropsten.infura.io/U8U4n8mm2wDgB2e3Dksv",
            chainId: ethers.utils.getNetwork('ropsten').chainId
        }
    },
    production: {
        environment: "production",
        databasefile: "data/reststore",
        authenticatedaccounts: ["0x00"],
    }
};
const config = process.env.NODE_ENV
    ? configs[process.env.NODE_ENV]
    : configs.dev;

console.log(`env=${process.env.NODE_ENV}`);
console.log(`config=`, config);

module.exports = {
    ...config
};
