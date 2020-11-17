const schedule = require('node-schedule');
const axios = require("axios");
const config = require("config");
const IPFS = require('ipfs-http-client');
const ipfs = new IPFS(config.ipfshost);
const transactions = require("./transactions");

const getNextNotarizeTimestamp = () => {
    return Date.now() + 1 * 60 * 1000;
}
const getCurrentTimestamp = () => {
    return Date.now();
}

const runSchedule = () => {
    console.log("schedule");
    axios.get(`${config.apiurl}/hash/queue`).then(async (res) => {
        let payload = res.data;
        console.log("received payload", payload);
        if (payload && payload.hashes && payload.hashes.length > 0) {
            if (payload.parenthash) {
                payload.parenthashsig = await transactions.signData(payload.parenthash);
            }
            const data = Buffer.from(JSON.stringify(payload));
            console.log("Adding payload to IPFS", data);
            ipfs.add(data, 'utf-8')
                .then(async (hash) => {
                    console.log("Payload added to IPFS", hash);
                    hash = hash.path;
                    console.log("Payload added to IPFS", hash);
                    transactions.createTx(hash).then((signedtx) => {
                        console.log("Signed Tx", signedtx);
                        const ethers = require("ethers");
                        const tx = ethers.utils.parseTransaction(signedtx);
                        transactions.sendTx(signedtx).then((txresult) => {
                            console.log("Tx sent", txresult);
                            if (hash) {
                                const notarizeresult = {
                                    hashes: payload.hashes,
                                    roothash: hash,
                                    tx: tx,
                                    txhash: tx.hash,
                                    nextnotaryevent: getNextNotarizeTimestamp()
                                }
                                console.log("confirming notarization event", notarizeresult);
                                axios.post(`${config.apiurl}/hash/confirm`, notarizeresult).then((res) => {
                                    console.log(res.status);
                                });
                            } else {

                            }
                            console.log("tx sent", res);
                        })
                    });
                })
                .catch((e) => {
                    console.log("Error adding data to IPFS", e);
                });
        } else {
            console.log("no hashes to notarize.");
            const nextUp = getNextNotarizeTimestamp();
            const nextUpDelta = nextUp - getCurrentTimestamp();
            const notarizeresult = {
                nextnotaryevent: nextUp,
                nextnotaryeventin: nextUpDelta,
            };
            
            axios.post(`${config.apiurl}/hash/confirm`, notarizeresult).then((res) => {
                console.log(`${res.status} - next event at ${Date(nextUp)} (in ${Math.floor(nextUpDelta/1000)}s)`);
            });
        }
    })
};

console.log("Starting scheduler");

var j = schedule.scheduleJob('*/1 * * * *', function () {
    runSchedule();
});

console.log("Scheduler started");


runSchedule();


