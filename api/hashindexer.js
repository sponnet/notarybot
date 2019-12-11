const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const events = new MyEmitter();
const config = require("config");
const models = require("./models");
const IPFS = require('ipfs-mini');
const ipfs = new IPFS(config.ipfshost);
const ethers = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(config.ethers.jsonproviderurl);

module.exports = (server) => {
    const indexTxHash = async (txhash) => {
        console.log("indexing", txhash);

        const txIndexed = await models.transaction.findOne({
            where: { hash: txhash },
        }).then(instance => {
            return (instance !== null)
        });

        if (txIndexed) {
            console.log(`txhash ${txhash} marked as indexed in DB - done!`);
            events.emit("indexupdated");
            return;
        }

        provider.getTransaction(txhash).then((t) => {
            // console.log("t=", t);
            provider.getBlock(t.blockNumber).then((b) => {
                // console.log("b=", b);
                const hash = ethers.utils.toUtf8String(t.data);
                // console.log("hash=", hash);
                ipfs.catJSON(hash, (err, data) => {
                    if (err) {
                        console.log(`ipfs error`, err);
                        setTimeout(() => {
                            console.log("try again with hash", txhash);
                            indexTxHash(txhash)
                        }, 5 * 1000);
                    } else {
                        console.log("Adding hashes ", data.hashes, "to txhash", txhash);
                        models.sequelize.transaction(t => {
                            return Promise.all(data.hashes.map((hash) => {
                                const metaData = {
                                    txhash: txhash,
                                    blocknumber: b.number,
                                    timestamp: b.timestamp * 1000
                                }
                                console.log(`${hash} is part of ${txhash}`, metaData);
                                return models.hash
                                    .update(
                                        { metadata: JSON.stringify(metaData) },
                                        { where: { hash: hash }, transaction: t })
                            }))
                        }).then(() => {
                            return models.transaction
                                .findOrCreate({
                                    where: { hash: txhash },
                                    defaults: {
                                        hash: txhash,
                                    }
                                }).then(() => {
                                    if (data.parenttx) {
                                        console.log("recursing!");
                                        indexTxHash(data.parenttx)
                                    } else {
                                        console.log("DONE");
                                        events.emit("indexupdated");
                                    }
                                }).catch((e) => {
                                    console.log("saving txhash failed", e);
                                })
                        })
                    }
                })
            }).catch((e) => {
                // cannot find txhash
                console.log(`txhash ${txhash} not found`);
                events.emit("indexupdated");
            })
        }).catch((e) => {
            // cannot find txhash
            console.log(`txhash ${txhash} not found`);
            events.emit("indexupdated");
        })

    }

    events.on("reindex", (txhash) => {
        console.log("Reindexing from", txhash);
        indexTxHash(txhash);
    });

    return {
        events: events,
    }
}
