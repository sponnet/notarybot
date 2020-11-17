const configs = {
    development: {
        name: "prod",
        api: {
            URL: "ws://localhost:5005",
            HTTPURL: "http://localhost:5005"
        },
        txeplorerurl: "https://ropsten.etherscan.io/tx",
        ipfshost: { host: '80.208.229.228', port: 5001, protocol: 'http' },
        ipfsgw: "http://80.208.229.228:8080/ipfs"
    },
    ropsten: {
        name: "dev",
        api: {
            URL: "wss://ropsten.api.robonotary.datapinner.com",
            HTTPURL: "https://ropsten.api.robonotary.datapinner.com"
        },
        txeplorerurl: "https://ropsten.etherscan.io/tx",
        networknote: "Ropsten",
        ipfshost: { host: '80.208.229.228', port: 5001, protocol: 'http' },
        ipfsgw: "http://80.208.229.228:8080/ipfs"
    },    
    production: {
        name: "prod",
        api: {
            URL: "wss://localhost:5005",
            HTTPURL: "http://localhost:5005"
        },
        txeplorerurl: "https://etherscan.io/tx",
        ipfshost: { host: '80.208.229.228', port: 5001, protocol: 'http' },
        ipfsgw: "http://80.208.229.228:8080/ipfs"
    }
};
let config = process.env.REACT_APP_STAGE
    ? configs[process.env.REACT_APP_STAGE]
    : configs.development;

export default {
    ...config
};
