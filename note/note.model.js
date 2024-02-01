const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        note_id: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        content: { type: DataTypes.TEXT, allowNull: true },
        category_id: { type: DataTypes.STRING, allowNull: false },
        user_id: { type: DataTypes.STRING, allowNull: false },
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
    const Note = sequelize.define('Note', attributes, options);
    // db.User.hasMany(Note, { foreignKey: 'user_id', sourceKey: 'user_id' });
    // Note.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    return Note;
}