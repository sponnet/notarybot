const WebSocket = require('ws');
const models = require("./models");
const Sequelize = require("sequelize");
const config = require("./config");
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const events = new MyEmitter();

module.exports = (server) => {
    const broadcast = (message) => {
        let count = 0;
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
                count++;
            }
        });
        console.log(`broadcasted to ${count} online clients`);
    }

    const hashqueueCount = async () => {
        return await models.hash.count({ where: { 'publicationstatus': { [Sequelize.Op.eq]: models.constants.hash.publicationstatus.POSTED } } });
    }

    const hashedNotarizedCount = async () => {
        return await models.hash.count({ where: { 'publicationstatus': { [Sequelize.Op.eq]: models.constants.hash.publicationstatus.PUBLISHED } } });
    }

    const nextNotaryEvent = async () => {
        return await models.keyvalue.findOne({
            where: { key: "nextnotaryevent" },
        }).then(instance => {
            if (!instance) {
                console.log("nextnotaryevent from DB not found");
                return Math.floor(Date.now() + config.interval);
            }
            let i = instance.get({
                plain: true
            });
            const nextEvent = parseInt(i.value);
            return nextEvent;
        })
    }

    const roothash = async () => {
        return await models.keyvalue.findOne({
            where: { key: "roothash" },
        }).then(instance => {
            if (!instance) {
                return null;
            }
            let i = instance.get({
                plain: true
            });
            return i.value;
        })
    }

    const txhash = async () => {
        return await models.keyvalue.findOne({
            where: { key: "txhash" },
        }).then(instance => {
            if (!instance) {
                return null;
            }
            let i = instance.get({
                plain: true
            });
            return i.value;
        })
    }

    const getStats = async () => {
        return ([
            { command: "totalhashes", data: await hashedNotarizedCount() },
            { command: "hashesqueuelength", data: await hashqueueCount() },
            { command: "nextnotaryevent", data: await nextNotaryEvent() },
            { command: "roothash", data: await roothash() },
            { command: "txhash", data: await txhash() }
        ])
    }

    const sendStats = async () => {
        broadcast(await getStats());
    };

    events.on("sendstats", () => {
        console.log("event triggered - broadcast stats to clients");
        sendStats();
    })

    events.on("indexupdated", () => {
        broadcast([{command:"indexupdated"}]);
    });

    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        console.log(`Connected from ${req.connection.remoteAddress}`);
        ws.send(JSON.stringify(await getStats()));
        ws.on('message', async (message) => {
            const m = JSON.parse(message); // TODO validate payload
            switch (m.command) {
                case "getstats":
                    ws.send(JSON.stringify(await getStats()));
                    ws.send(JSON.stringify([{ command: "processed" }]));
                    break;
                default:
                    console.log("unknown message", message);
            }
        });
    });

    return {
        wss: wss,
        broadcast: broadcast,
        events: events,
    }
};


