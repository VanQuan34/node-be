const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    // const connection = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
    const connection = mysql.createPool({
        user: user,
        password: password,
        host: host,
        port: port,
        database: database
      });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, {
         dialect: 'mysql',
         host: host, // Specify your database host
         port: port
        });

    // // init models and add them to the exported db object
    db.User = require('../users/user.model')(sequelize);
    db.Chat = require('../chat/chat.model')(sequelize);
    db.Note = require('../note/note.model')(sequelize);

    // sync all models with database
    await sequelize.sync();
}