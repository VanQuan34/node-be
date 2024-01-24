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
    getNoteByCategory,
    getDetailsById,
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
        data: await db.Note.findAll({
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
    return await getNote(id);
}

async function getDetailsById(id) {
    return await getDetailsNote(id);
}

async function getNoteByCategory(id){
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

async function create(params) {
    await db.Note.create(params);
    return params;
}

async function update(id, content) {
    const note = await getNote(id);
    if(!note) throw 'Invalid note';
    note.content = content;
    await note.save();
    return note.get();
}

async function _delete(id) {
    const note = await getNote(id);
    await note.destroy();
}

// helper functions

async function getNote(id) {
    // const note = await db.User.findByPk(id);
    const note = await db.Note.findOne({ where: { note_id: id } });
    if (!note) throw 'Note not found';
    return note;
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

async function getDetailsNote(id) {
    // const note = await db.User.findByPk(id);
    const note = await db.Note.findAll({ where: { note_id: id } });
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