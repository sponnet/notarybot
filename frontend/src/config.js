const configs = {
    development: {
        name: "dev",
        api: {
            URL: "ws://localhost:5005",
            HTTPURL: "http://localhost:5005"
        },
        txeplorerurl: "https://ropsten.etherscan.io/tx",
        networknote: "Ropsten",
        ipfshost: { host: '23.254.227.151', port: 5001, protocol: 'http' },
    },
    production: {
        name: "prod",
        api: {
            URL: "ws://localhost:5005",
            HTTPURL: "http://localhost:5005"
        },
        txeplorerurl: "https://etherscan.io/tx",
        ipfshost: "https://ipfs.io:5001",
    }
};
let config = process.env.REACT_APP_STAGE
    ? configs[process.env.REACT_APP_STAGE]
    : configs.development;

export default {
    ...config
};
