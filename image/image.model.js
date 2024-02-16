const { DataTypes } = require('sequelize');
module.exports = model;

function model(sequelize) {
    const attributes = {
        image_id: { type: DataTypes.STRING, allowNull: false },
        user_id: { type: DataTypes.STRING, allowNull: false },
        data: { type: DataTypes.TEXT, allowNull: false },
        category_id: { type: DataTypes.STRING, allowNull: true },  
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

    const Image = sequelize.define('Image', attributes, options);
    // db.User.hasMany(Chat, { foreignKey: 'user_id', sourceKey: 'user_id' });
    // Chat.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    return Image;
}