const Sequelize = require("sequelize");
const db = require("../db.js");

module.exports = {
    model:
        db.sequelize.define("hash", {
            hash: Sequelize.STRING,
            owner: Sequelize.STRING,
            publicationstatus: Sequelize.TINYINT,
            metadata: Sequelize.TEXT
        }),
    constants: {
        publicationstatus: {
            POSTED: 1,
            PUBLISHING: 2,
            PUBLISHED: 3
        }
    }
};
