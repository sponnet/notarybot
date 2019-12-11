const Sequelize = require("sequelize");
const db = require("../db.js");

module.exports = {
    model:
        db.sequelize.define("keyvalue", {
            key: Sequelize.STRING,
            value: Sequelize.TEXT
        }),
    constants: {
    }
};
