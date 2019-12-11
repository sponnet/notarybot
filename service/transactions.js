const ethers = require("ethers");
const config = require("./config");
const axios = require("axios");

const provider = new ethers.providers.JsonRpcProvider(config.ethers.jsonproviderurl);
const wallet = new ethers.Wallet(config.ethers.privateKey, provider);



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

    // All properties are optional
    let transaction = {
        nonce: nonce,
        gasLimit: 100000,
        gasPrice: ethers.utils.bigNumberify(gasPrice * 1000000000),
        to: "0x00000000000000000000726F626F6E6F74617279",
        data: ethers.utils.toUtf8Bytes(data),
        // This ensures the transaction cannot be replayed on different networks
        chainId: config.ethers.chainId
    }
    console.log("data", data);
    console.log("Transaction", transaction);

    return wallet.sign(transaction)
}

const sendTx = (signedTransaction) => {

    // This can now be sent to the Ethereum network

    return provider.sendTransaction(signedTransaction);
    // .then((tx) => {

    //     console.log(tx);
    //     // {
    //     //    // These will match the above values (excluded properties are zero)
    //     //    "nonce", "gasLimit", "gasPrice", "to", "value", "data", "chainId"
    //     //
    //     //    // These will now be present
    //     //    "from", "hash", "r", "s", "v"
    //     //  }
    //     // Hash:
    // });

}

module.exports = {
    createTx,
    sendTx,
    signData
}
