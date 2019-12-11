const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");
const chalk = require("chalk");
const printf = require("printf");
const models = require("./models");
const morgan = require('morgan')
const config = require("config");

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: [
        /^http:\/\/localhost(:[\d]+)?$/,
        "https://*.netlify.com",
        "https://app.relai.ch"
    ],
    allowHeaders: ["admintoken", "sessionid"]
});

const server = restify.createServer({
    name: "ROBONOTARY",
    version: "1.0.0"
});

console.log(config);

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.pre(cors.preflight);
server.use(cors.actual);

// set up logging
server.use(morgan('combined'));

// attach routes
const hashEvents = require("./routes/hash")(server);

// attach sockethandler
const socketHandler = require("./sockethandler.js")(server);

// attach sockethandler
const indexerHandler = require("./hashindexer.js")();

// bind events
hashEvents.on("statschanged", () => {
    console.log("index: stats chnged");
    socketHandler.events.emit("sendstats");
})

hashEvents.on("txhashchanged", (txhash) => {
    console.log("index: root hash changed",txhash);  
    // socketHandler.events.emit("newtxroot");
    indexerHandler.events.emit("reindex",txhash);
})

indexerHandler.events.on("indexupdated",()=>{
    socketHandler.events.emit("indexupdated");
});


server.get("/ping", function (req, res, next) {
    return res.send(200);
});

const listAllRoutes = server => {
    Object.entries(server.router.getRoutes())
        .sort((a, b) => {
            return a[1].path.localeCompare(b[1].path);
        })
        .map(route => {
            console.log(
                chalk.yellow(printf("%*s", route[1].method, 6)),
                route[1].path
            );
        });
};

models.init().then(() => {
    server.listen(config.port || 5005, function () {
        listAllRoutes(server);
        console.log("Running in environment %s", config.environment);
        console.log("%s listening at  %s", server.name, server.url);
    });
});
