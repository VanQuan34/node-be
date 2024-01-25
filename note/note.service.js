const db = require('_helpers/db');
const jwt = require('jsonwebtoken');
const { secret } = require('config.json');

module.exports = {
    getAll,
    getById,
    getNoteByCategory,
    getDetailsById,
    create,
    update,
    delete: _delete
};

async function getAll(page) {
    try {
      const limit = 15;
      const noteData = await db.Note.findAll({
        order: [
          ['createdAt', 'ASC'] // Order by the specified column and direction
        ],
        where: {user_id: globalThis.currentId},
        limit: limit,
        offset: parseInt(page - 1) * limit
      });
      
      return {
        code: 200,
        data: noteData,
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