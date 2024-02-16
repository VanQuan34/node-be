const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize');
const authorizeReset = require('_middleware/reset-password');
const userService = require('./user.service');
// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);
router.post('/reset-password', resetSchema, resetPassword);
router.post('/new-password', authorizeReset(), resetNewSchema, newPassword);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function resetSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function resetNewSchema(req, res, next) {
    const schema = Joi.object({
        password: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        username: Joi.string().min(5).max(25).required(),
        password: Joi.string().min(6).max(25).required().custom((value, helpers) => {
            if (value.includes(' ')) {
                return helpers.error('string.noSpaces');
            }
            return value;
        }, 'no spaces allowed'),
        role: Joi.string().required(),
        department: Joi.string().required(),
        email: Joi.string().required(),
        status: Joi.boolean().required(),
    }).messages({
        'string.noSpaces': 'Password cannot contain spaces'
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
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
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
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
    userService.update(req.params.id, req.body)
        .then(user => res.json({
                code: 200,
                data: user,
                message: 'Update successful'
            })
            )
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}

function resetPassword(req, res, next) {
    userService.resetPassword(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function newPassword(req, res, next) {
    userService.resetNewPassword(req, res, next)
        .then(user => res.json({code: 200, message: 'Password reset successfully'}))
        .catch(next);
}