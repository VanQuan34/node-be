const { DataTypes } = require('sequelize');
const db = require('_helpers/db');
module.exports = model;

function model(sequelize) {
    const attributes = {
        room_id: { type: DataTypes.STRING, allowNull: false },
        user_id: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.STRING, allowNull: false },    
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: [] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    const Chat = sequelize.define('Chat', attributes, options);
    Chat.belongsTo(db.User, { foreignKey: 'user_id' });
    // Chat.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    return Chat;
}