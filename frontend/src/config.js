const configs = {
    development: {
        name: "prod",
        api: {
            URL: "wss://localhost:5005",
            HTTPURL: "http://localhost:5005"
        },
        txeplorerurl: "https://etherscan.io/tx",
        ipfshost: { host: '23.254.227.151', port: 5001, protocol: 'http' },
    },
    ropsten: {
        name: "dev",
        api: {
            URL: "wss://ropsten.api.robonotary.datapinner.com",
            HTTPURL: "https://ropsten.api.robonotary.datapinner.com"
        },
        txeplorerurl: "https://ropsten.etherscan.io/tx",
        networknote: "Ropsten",
        ipfshost: { host: 'ipfs.web3.party', port: 5001, protocol: 'https' },
    },    
    production: {
        name: "prod",
        api: {
            URL: "wss://localhost:5005",
            HTTPURL: "http://localhost:5005"
        },
        txeplorerurl: "https://etherscan.io/tx",
        ipfshost: { host: '23.254.227.151', port: 5001, protocol: 'http' },
    }
};
let config = process.env.REACT_APP_STAGE
    ? configs[process.env.REACT_APP_STAGE]
    : configs.development;

export default {
    ...config
};
