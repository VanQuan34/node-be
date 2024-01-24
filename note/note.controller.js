const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const noteService = require('./note.service');
// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/create', authorize(), createSchema, create);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/details/:note_id', authorize(), getDetailById);
router.get('/category/:category_id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    noteService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

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
  console.log('vao day')
    noteService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
  console.log('req.params.category_id=', req.params.category_id);
    noteService.getById(req.params.category_id)
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
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        username: Joi.string().empty(''),
        password: Joi.string().min(6).empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    noteService.update(req.params.id, req.body)
        .then(user => res.json({
                code: 200,
                data: user,
                message: 'Update successful'
            })
            )
        .catch(next);
}

function _delete(req, res, next) {
    noteService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}