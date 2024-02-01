const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const cateService = require('./category.service');
// routes
router.post('/create', authorize(), createSchema, create);
router.get('/:type', authorize(), getAll);
router.patch('/:type/:id', authorize(), updateSchema, update);
router.delete('/:type/:id', authorize(), _delete);

module.exports = router;


function createSchema(req, res, next) {
    const schema = Joi.object({
        cate_name: Joi.string(),
        cate_description: Joi.string(),
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
        cate_name: Joi.string().empty(''),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    cateService.update(req.params.id, req.params.type, req.body)
        .then(category => res.json({
                code: 200,
                data: category,
                message: 'Update successful'
            })
            )
        .catch(next);
}

function _delete(req, res, next) {
    cateService.delete(req.params.id, req.params.type )
        .then(() => res.json({ code: 200, message: 'Category deleted successfully' }))
        .catch(next);
}