const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const uid = require('uid');
const { cloneDeep } = require('lodash');
module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll(type) {
    return {
        code: 200,
        data: await db.Category.findAll({
            order: [['createdAt', 'DESC']], // Order by createdAt in descending order
            where: {cate_type: type}
          }),
        message: 'Request success'
    }
}

// {
//     order: [['createdAt', 'DESC']], // Order by createdAt in descending order
//     offset: 2,
//     limit: 2,
//   }

async function getById(id) {
    return await getNote(id);
}

async function create(params) {
    if (await db.Category.findOne({ where: { cate_name: params.cate_name, cate_type: params.cate_type, } })) {
        throw 'Danh mục "' + params.cate_name + '" đã tồn tại';
    }
    await db.Category.create(params);
    return params;
}

async function update(id, params) {
    const user = await getNote(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getNote(id);
    await user.destroy();
}

// helper functions

async function getNote(id) {
    // const note = await db.User.findByPk(id);
    const note = await db.Note.findAll({ where: { category_id: id } });
    if (!note){
      return {
        code : 200,
        data: [],
        message: 'Request success'
      }
    }
    return {
      code : 200,
      data: note,
      message: 'Request success'
    }
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}