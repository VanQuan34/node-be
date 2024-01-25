const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const noteService = require('./note.service');
// routes
router.post('/create', authorize(), createSchema, create);
router.get('/', authorize(), getAll);
router.get('/details/:note_id', authorize(), getDetailById);
router.get('/category/:category_id', authorize(), getNoteByCategory);
router.patch('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        note_id: Joi.string().required(),
        content: Joi.string(),
        user_id: Joi.string().required(),
        category_id: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    noteService.create(req.body)
        .then((data) => res.json(
            {
                code: 200,
                data: data,
                message: 'Created note successful'
            }
            ))
        .catch(next);
}

function getAll(req, res, next) {
    const page = req.query.page || 1;
    // const token = req.headers['authorization'].split(' ')[1];
    noteService.getAll(page)
        .then(notes => res.json(notes))
        .catch(next);
}

function getNoteByCategory(req, res, next) {
  console.log('req.params.category_id=', req.params.category_id);
    noteService.getNoteByCategory(req.params.category_id)
        .then(note => res.json(note))
        .catch(next);
}

function getDetailById(req, res, next){
      noteService.getDetailsById(req.params.note_id)
          .then(note => res.json(note))
          .catch(next);
  }

function updateSchema(req, res, next) {
    const schema = Joi.object({
        content: Joi.string(),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    noteService.update(req.params.id, req.body.content)
        .then(note => res.json({
                code: 200,
                data: note,
                message: 'Update successful'
            })
            )
        .catch(next);
}

function _delete(req, res, next) {
    noteService.delete(req.params.id)
        .then(() => res.json(
            {
                code: 200,
                message: 'Note deleted successfully'
            })
        )
        .catch(next);
}