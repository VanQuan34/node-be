const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const chatService = require('./chat.service');
// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/create',authorize(), registerSchema, register);
router.get('/', authorize(), getAll); //authenticate
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
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
    chatService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        room_id: Joi.string().required(),
        user_id: Joi.string().required(),
        message: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    chatService.create(req.body)
        .then((data) => res.json(
            {
                code: 200,
                data: data,
                message: 'Registration successful'
            }
            ))
        .catch(next);
}

function getAll(req, res, next) {
    chatService.getAll()
        .then(chats => res.json(chats))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    chatService.getById(req.params.id)
        .then(user => res.json(user))
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
    chatService.update(req.params.id, req.body)
        .then(user => res.json({
                code: 200,
                data: user,
                message: 'Update successful'
            })
            )
        .catch(next);
}

function _delete(req, res, next) {
    chatService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}