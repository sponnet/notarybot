const db = require("../db.js").sequelize;
const sequelize_fixtures = require('sequelize-fixtures');
const fixtures = require("./fixtures");

const models = {
    hash: require("./hash").model,
    transaction: require("./transaction").model,
    keyvalue: require("./keyvalue").model,
};

const constants = {
    hash: require("./hash").constants,
    keyvalue: require("./keyvalue").constants,
}

const init = () => {

    return Promise.all([
        Object.keys(models).map(key => {
            console.log("model", key, typeof models[key]);
            return models[key].sync();
        })
    ]).then(() => {

        return sequelize_fixtures.loadFixtures(fixtures, models, {
            logger: {
                debug: console.log,
                info: console.log,
                warn: console.log,
                error: console.log
            }
        });

    });



};

module.exports = {
    sequelize: db,
    init: init,
    constants: constants,
    ...models
};
