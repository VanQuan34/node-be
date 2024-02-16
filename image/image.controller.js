const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize')
const imageService = require('./image.service');
const multer = require('multer');
// routes

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', upload.single('image'),  register);
router.get('/', authorize(), getAll); //authenticate
router.delete('/:id', authorize(), _delete);

module.exports = router;

function register(req, res, next) {
    imageService.create(req, res)
        .then((data) => res.json(
            {
                code: 200,
                data: data,
                message: 'Upload file successful'
            }
            ))
        .catch(next);
}

function getAll(req, res, next) {
    const perPage = req.query?.page || 1;
    imageService.getAll(perPage)
        .then(images => res.json(images))
        .catch(next);
}

function _delete(req, res, next) {
    imageService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}