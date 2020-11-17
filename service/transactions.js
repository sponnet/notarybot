const ethers = require("ethers");
const config = require("config");
const axios = require("axios");

const provider = new ethers.providers.JsonRpcProvider(config.ethers.jsonproviderurl);
const wallet = new ethers.Wallet("0x" +  config.ethers.privateKey, provider);



const getGasPrice = () => {
    return new Promise((resolve, reject) => {
        axios.get(`https://ethgasstation.info/json/ethgasAPI.json`).then((res) => {
            if (res && res.data && res.data.safeLow) {
                return resolve(res.data.safeLow);
            } else {
                reject();
            }
        }).catch((err) => {
            return reject();
        });
    })
}

const signData = (data) => {
    return wallet.signMessage(data);
}

const createTx = async (data) => {

    const gasPrice = await getGasPrice();
    const nonce = await wallet.getTransactionCount();

    let transaction = {
        nonce: nonce,
        gasLimit: 100000,
        gasPrice: ethers.BigNumber.from(gasPrice * 1000000000),
        to: "0x00000000000000000000726F626F6E6F74617279",
        data: ethers.utils.toUtf8Bytes(data),
        chainId: config.ethers.chainId
    }
    console.log("data", data);
    console.log("Transaction", transaction);

    return wallet.signTransaction(transaction)
}

const sendTx = (signedTransaction) => {
    return provider.sendTransaction(signedTransaction);
}

module.exports = {
    createTx,
    sendTx,
    signData
}
