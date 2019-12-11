const Sequelize = require("sequelize");
const db = require("../db.js");

module.exports = {
    model:
        db.sequelize.define("transaction", {
            hash: Sequelize.STRING,
            metadata: Sequelize.TEXT
        }),
    constants: {
    }
};
