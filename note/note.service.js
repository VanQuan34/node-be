const db = require('_helpers/db');
const uid = require('uid');
const { Sequelize } = require('sequelize');

module.exports = {
    getAll,
    getById,
    getNoteByCategory,
    getDetailsById,
    create,
    duplicate,
    update,
    delete: _delete
};

async function getAll(query) {
    try {
      const limit = 15;
      const page = query?.page || 1;
      const where = {user_id: globalThis.currentId};
      if(query?.search){
        where.title = {[Sequelize.Op.like]: `%${query.search}%`}
      }
      const noteData = await db.Note.findAll({
        attributes: ['note_id', 'title', 'description', 'category_id', 'user_id', 'createdAt'],
        order: [
          ['createdAt', 'DESC'] // Order by the specified column and direction
        ],
        where: where,
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

async function getNoteByCategory(id, query){
  const where =  { category_id: id };
  if(query?.search){
    where.title = {[Sequelize.Op.like]: `%${query.search}%`}
  }
  const note = await db.Note.findAll({
    attributes: ['note_id', 'title', 'description', 'category_id', 'user_id', 'createdAt'],
    where: where
  });

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
    params['note_id'] = uid.uid(16);
    if (await db.Note.findOne({ where: { title: params.title } })) {
      throw 'Title "' + params.title + '" is already taken';
    }
    await db.Note.create(params);
    const noteRes = await getNote(params['note_id']);
    return noteRes.get();
}

async function duplicate(params) {
  const note = await getNote(params.note_id);
  if (!note) throw 'Note not found';
  
  params['note_id'] = uid.uid(16);
  params['content'] = note['content'];
  params['description'] = note['description'];
  if (await db.Note.findOne({ where: { title: params.title } })) {
    throw 'Title "' + params.title + '" is already taken';
  }
  await db.Note.create(params);
  const noteRes = await getNote(params['note_id']);
  return noteRes.get();
}

async function update(id, body) {
    const note = await getNote(id);
    if(!note) throw 'Invalid note';
    if(body?.title){
      if (body.title != note.title && await db.Note.findOne({ where: { title: body.title } })) {
        throw 'Title "' + body.title + '" is already taken';
      }
      note.title = body.title;
    }
    if(body?.description){
      note.title = body.description;
    }
    if(body?.content){
      note.content = body.content;
    }
    
    Object.assign(note, body);
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
    const note = await db.Note.findOne({ where: { note_id: id } });
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