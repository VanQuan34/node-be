const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        category_id: { type: DataTypes.STRING, allowNull: false },
        cate_name: { type: DataTypes.STRING, allowNull: false },
        cate_description: { type: DataTypes.STRING, allowNull: false },
        user_created: { type: DataTypes.STRING, allowNull: false },
        cate_type: { type: DataTypes.STRING, allowNull: false },
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
    const Category = sequelize.define('Category', attributes, options);
    // db.User.hasMany(Category, { foreignKey: 'user_created', sourceKey: 'user_id' });
    // Category.belongsTo(db.User, { foreignKey: 'user_created', targetKey: 'user_id' });
    return Category;
}