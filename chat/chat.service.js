const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const uid = require('uid');
const { Sequelize } = require('sequelize');
const { User } = require('../users/user.model'); // Adjust the path accordingly
const { Chat } = require('../chat/chat.model'); // Adjust the path accordingly
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
    const newUser = cloneDeep(user);
    newUser['hash'] = undefined;

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';
    // authentication successful
    const token = jwt.sign({ sub: newUser }, config.secret, { expiresIn: '1d' });
    return { ...omitHash(user.get()), token };
}

async function getAll(page) {
    // return {
    //     code: 200,
    //     data: await db.Chat.findAll(),
    //     message: 'Request success'
    // }
    try {
        const limit = 15;
        const chatData = await db.Chat.findAll({
          include: [{
            model: db.User,
            attributes: ['firstName', 'lastName', 'username', 'user_id', 'email', 'role', 'department', 'status'],
            // where: { user_id: Sequelize.col('Chat.user_id') }
          }],
          order: [
            ['createdAt', 'DESC'] // Order by the specified column and direction
          ],
          limit: limit,
          offset: parseInt(page - 1) * limit
        });

        const formattedChatData = chatData.map(chat => {
            const { User, ...rest } = chat.toJSON();
            return { user: User, ...rest };
        });
        
        return {
          code: 200,
          data: formattedChatData,
          message: 'Request success'
        };
      } catch (error) {
        console.error('Error fetching data:', error);
        return {
          code: 200,
          data: [],
          message: 'Request success er'
        };
      }
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    const paramDefault = {
        room_id: '1223334444',
        user_id: '',
        message: '',
    }
    // save user
    await db.Chat.create(params);
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