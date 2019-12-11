const Sequelize = require("sequelize");
const path = require("path");
const config = require("./config");

const fileName = path.join(__dirname, config.databasefile);

console.log("Initiating database file", fileName);

const sequelize = new Sequelize("database", "username", "password", {
    dialect: "sqlite",
    storage: fileName,
    logging: false,
    transactionType: "IMMEDIATE"
});


module.exports = { sequelize: sequelize };
