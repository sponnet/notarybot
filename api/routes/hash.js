const models = require("../models");
const modelName = "hash";
const isIPFS = require('is-ipfs')
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const events = new MyEmitter();

module.exports = server => {

    getqueue = (req, res, next) => {
        Promise.all([
            models.hash.findAll({
                attributes: ["hash"],
                where: { publicationstatus: models.constants.hash.publicationstatus.POSTED },
            }).then(response => {
                return response;
            }),
            models.keyvalue.findOne({
                where: { key: "roothash" },
            }).then(instance => {
                if (!instance) {
                    return ""
                }
                let i = instance.get({
                    plain: true
                });
                return i.value;
            }),
            models.keyvalue.findOne({
                where: { key: "txhash" },
            }).then(instance => {
                if (!instance) {
                    return ""
                }
                let i = instance.get({
                    plain: true
                });
                return i.value;
            })
        ]).then(([instances, roothash, txhash]) => {
            const resInstances = instances
                .map(instance => {
                    let i = instance.get({
                        plain: true
                    });
                    return i.hash;
                })
            return res.send(200, {
                hashes: resInstances,
                parenthash: roothash,
                parenttx: txhash,
            });
        });
    };

    const queryhash = (hash) => {
        if (!isIPFS.multihash(hash)) {
            return Promise.reject();
        }

        return Promise.all([
            models.hash.findOne({
                attributes: ["publicationstatus", "metadata"],
                where: { hash: hash },
            }).then(response => {
                return response;
            })
        ]).then(([instance]) => {
            if (!instance) {
                return null;
            }
            let i = instance.get({
                plain: true
            });
            return ({ hash: hash, status: i.publicationstatus, metadata: i.metadata ? JSON.parse(i.metadata) : null });
        });
    }

    // fetch info of single hash
    gethash = (req, res, next) => {
        const hash = req.params.hash;
        queryhash(hash)
            .then((hashinfo) => {
                if (!hashinfo) {
                    res.send(404);
                }
                res.send(200, hashinfo);
            })
            .catch((e) => {
                res.send(500, e);
            })

    };

    // fetch info of array of hashes
    gethashes = async (req, res, next) => {
        const hashes = req.body;
        console.log("Get info on hashes",hashes)
        if (!Array.isArray(hashes)) {
            return res.send(400, "no array of hashes provided");
        }
        if (hashes.length > 1000) {
            return res.send(400, "array too long (max 1000)");
        }
        // ipfsHashes = list of hashes that have an IPFS hash format
        const ipfsHashes = hashes.reduce((accum, item) => {
            if (isIPFS.multihash(item)) {
                accum.push(item);
            }
            return accum;
        }, []);

        if (ipfsHashes.length === 0) {
            return res.send(400, "no array of IPFS hashes provided");
        }

        try {
            const results = await Promise.all(ipfsHashes.map(async (hash) => {
                return queryhash(hash);
            }));

            res.send(200, results.filter(function (el) {
                return el != null;
            }));

        } catch (e) {
            res.send(500);
        }
    }

    // post array of hashes for notarizing
    post = (req, res) => {
        if (!req.body || !Array.isArray(req.body)) {
            return res.send(400);
        }
        req.body.forEach((hash) => {
            if (!isIPFS.multihash(hash)) {
                return res.send(400);
            }
        });
        models.sequelize.transaction(t => {
            return Promise.all(req.body.map((hash) => {
                return models.hash
                    .findOrCreate({
                        where: { hash: hash },
                        defaults: {
                            hash: hash,
                            publicationstatus: models.constants.hash.publicationstatus.POSTED,
                        },
                        transaction: t
                    })
                    .then((res) => {
                        if (res && res.isNewRecord) {
                            console.log(`added ${hash}`)
                        }
                        if (res && !res.isNewRecord) {
                            console.log(`skipped ${hash}`)
                        }
                    });
            }));
        }).then(() => {
            events.emit("statschanged");
            return res.send(200);
        }).catch(err => {
            // err is whatever rejected the promise chain returned to the transaction callback
            return res.send(500, err.message);
        });
    };

    confirmhashes = (req, res) => {
        if (!req.body) {
            return res.send(400);
        }

        const hashes = req.body.hashes;
        const roothash = req.body.roothash;
        const nextnotaryevent = req.body.nextnotaryevent;
        const txhash = req.body.tx ? req.body.tx.hash : null;

        if (!hashes && nextnotaryevent) {
            // no hashes / tx done - just update the nextnotartyevent
            Promise.all([
                models.keyvalue
                    .update(
                        { value: nextnotaryevent },
                        { where: { key: "nextnotaryevent" } })
            ]).then((r) => {
                events.emit("statschanged");
                return res.send(200);
            })
        } else {
            // actual notary done... process it
            hashes.forEach((hash) => {
                if (!isIPFS.multihash(hash)) {
                    return res.send(400);
                }
            });
            models.sequelize.transaction(t => {
                return Promise.all(
                    hashes.map(async (hash) => {
                        if (isIPFS.multihash(hash)) {
                            await models.hash
                                .update(
                                    { publicationstatus: models.constants.hash.publicationstatus.PUBLISHED },
                                    { where: { hash: hash }, transaction: t })
                                .then(() => {
                                    console.log(`added ${hash}`);
                                });
                        }
                    }));
            }).then(result => {
                console.log(`new root=${roothash}`);
                console.log(`nextnotaryevent=${nextnotaryevent}`);


                Promise.all([
                    models.keyvalue
                        .update(
                            { value: roothash },
                            { where: { key: "roothash" } }),
                    models.keyvalue
                        .update(
                            { value: nextnotaryevent },
                            { where: { key: "nextnotaryevent" } }),
                    models.keyvalue
                        .update(
                            { value: txhash },
                            { where: { key: "txhash" } })
                ]).then((r) => {
                    events.emit("txhashchanged", txhash);
                    events.emit("statschanged");
                    return res.send(200);
                })
            }).catch(err => {
                return res.send(500, err.message);
            });
        }
    };

    // public routes
    server.get("/hash/queue", getqueue);
    server.post("/hash/confirm", confirmhashes);
    // verify single hash
    server.get("/hash/verify/:hash", gethash);
    // verify posted array of hashes
    server.post("/hash/verify", gethashes);
    server.post("/hash", post);

    server.get("/hash/reindex", (req, res) => {

        models.keyvalue.findOne({
            where: { key: "txhash" },
        }).then(instance => {
            if (!instance) {
                return ""
            }
            let i = instance.get({
                plain: true
            });
            events.emit("txhashchanged", i.value);
            return res.send(200);
        })
    }
    )

    return events;

};

