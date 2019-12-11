// const { SHA3 } = require("sha3");

module.exports = (req, res, next) => {
    // const token = req.headers["admintoken"] || req.query["admintoken"];
    // if (!token) {
    //     return res.send(403);
    // }
    // const hash = new SHA3(256);
    // hash.update(token);
    // console.log(hash.digest("hex"));
    // if (
    //     ![
    //         "6fa92954df32f326616a980e3cd184541b865499eaf3986d9a328077cef7c633",
    //         "10c9af744165d1f3d027e224390b8b7d03d748254b9489dab3857d56cdf8a8f2"
    //     ].includes(hash.digest("hex"))
    // ) {
    //     return res.send(403, { go: "away" });
    // }
    req.isAdmin = true;
    return next();
};
