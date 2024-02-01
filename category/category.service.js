const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const uid = require('uid');
module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll(type) {
    let response = await db.Category.findAll({
        attributes: ['category_id', 'cate_name', 'cate_description', [db.sequelize.fn('COUNT', db.sequelize.col('Notes.note_id')), 'note_amount']],
        include: [
            {
              model: db.Note,
              attributes: [],
              duplicating: false,
            },
          ],
        group: ['Category.category_id'],
        order: [['createdAt', 'DESC']], // Order by createdAt in descending order
        where: { cate_type: type, user_created: globalThis.currentId}
    });

    return {
        code: 200,
        data: response,
        message: 'Request success'
    }
}

async function getById(id) {
    return await getCategory(id);
}

async function create(params) {
    if (await db.Category.findOne({ where: { cate_name: params.cate_name, cate_type: params.cate_type, } })) {
        throw 'Danh mục "' + params.cate_name + '" đã tồn tại';
    }
    params['category_id'] = uid.uid(16);
    params['user_created'] = globalThis.currentId;
    await db.Category.create(params);
    const {user_created, cate_type,  ...data} = params;
    return data;
}

async function update(id, type,  params) {
    const category = await getCategory(id);
    // validate
    if (await db.Category.findOne({ where: { cate_name: params.cate_name, cate_type: type } })) {
        throw 'Category "' + params.cate_name + '" is already taken';
    }

    // copy params to user and save
    Object.assign(category, params);
    await category.save();

    return category.get();
}

async function _delete(id, type) {
    const record =  await getNoteByCategory(id);
    if(record.data.length){
        throw 'Không thể xóa do danh mục có bản ghi';
    }
    const category = await getCategory(id);
    await category.destroy();
}

// helper functions

async function getCategory(id) {
    // const note = await db.User.findByPk(id);
    const category = await db.Category.findOne({ where: { category_id: id } });
    if (!category) throw 'Note not found';
    return category;
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
