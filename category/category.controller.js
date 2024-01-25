const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const cateService = require('./category.service');
// routes
router.post('/create', authorize(), createSchema, create);
router.get('/:type', authorize(), getAll);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function createSchema(req, res, next) {
    const schema = Joi.object({
        category_id: Joi.string().required(),
        cate_name: Joi.string(),
        cate_description: Joi.string(),
        user_created: Joi.string().required(),
        cate_type: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    cateService.create(req.body)
        .then((data) => res.json(
            {
                code: 200,
                data: data,
                message: 'Created category successful'
            }
            ))
        .catch(next);
}

function getAll(req, res, next) {
    const type = req.params.type;
    cateService.getAll(type)
        .then(category => res.json(category))
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
    cateService.update(req.params.id, req.body)
        .then(user => res.json({
                code: 200,
                data: user,
                message: 'Update successful'
            })
            )
        .catch(next);
}

function _delete(req, res, next) {
    cateService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}