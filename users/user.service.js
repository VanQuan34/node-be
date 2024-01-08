const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const uid = require('uid');
const { cloneDeep } = require('lodash');
module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const newUser = cloneDeep(user);
    newUser['hash'] = undefined;
    newUser['id'] = undefined;
    const token = jwt.sign({ sub: newUser }, config.secret, { expiresIn: '1d' });
    const data = { ...omitHash(user.get()), token };
    return {
        code: 200,
        data: data,
        message: 'Xác thực thành công'
    }
}

async function getAll() {
    return {
        code: 200,
        data: await db.User.findAll({
            order: [['createdAt', 'DESC']], // Order by createdAt in descending order
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
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }
    params['user_id'] = uid.uid(16)

    // save user
    await db.User.create(params);
    delete params.password;
    delete params.hash;
    return params;
}

async function update(id, params) {
    const user = await getUser(id);

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
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    // const user = await db.User.findByPk(id);
    const user = await db.User.findOne({ where: { user_id: id } });
    if (!user) throw 'User not found';
    return user
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}