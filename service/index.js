const schedule = require('node-schedule');
const axios = require("axios");
const config = require("config");
const IPFS = require('ipfs-http-client');
const ipfs = new IPFS(config.ipfshost);
const transactions = require("./transactions");

const getNextNotarizeTimestamp = ()=>{
    return Date.now() + 1 * 60 * 1000;
}

const runSchedule = () => {
    axios.get(`${config.apiurl}/hash/queue`).then(async (res) => {
        let payload = res.data;
        if (payload && payload.hashes && payload.hashes.length > 0) {
            if (payload.parenthash) {
                payload.parenthashsig = await transactions.signData(payload.parenthash);
            }
            ipfs.add(Buffer.from(JSON.stringify(payload), 'utf-8')).then(async (hash) => {
                hash = hash[0].hash;
                transactions.createTx(hash).then((signedtx) => {
                    console.log("Signed Tx", signedtx);
                    const ethers = require("ethers");
                    const tx = ethers.utils.parseTransaction(signedtx);
                    transactions.sendTx(signedtx).then((res) => {
                        if (hash) {
                            const notarizeresult = {
                                hashes: payload.hashes,
                                roothash: hash,
                                tx: tx,
                                txhash: tx.hash,
                                nextnotaryevent: getNextNotarizeTimestamp()
                            }
                            console.log("notarize event", notarizeresult);
                            axios.post(`${config.apiurl}/hash/confirm`, notarizeresult).then((res) => {
                                console.log(res.status);
                            });
                        }
                        console.log("tx sent", res);
                    })
                });
            });
        } else {
            console.log("no hashes to notarize.");
            const nextUp = getNextNotarizeTimestamp();
            const notarizeresult = {
                nextnotaryevent: nextUp
            }
            axios.post(`${config.apiurl}/hash/confirm`, notarizeresult).then((res) => {
                console.log(`${res.status} - next event at ${Date(nextUp)} (${nextUp})`);
            });
        }
    })
};

var j = schedule.scheduleJob('*/1 * * * *', function () {
    runSchedule();
});

runSchedule();


