const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize() {
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),

        // attach full user record to request object
        async (req, res, next) => {
            // get user with id from token 'sub' (subject) property
            const user = await db.User.findByPk(req.user.sub.id);
            // const user = await db.User.findOne({ where: { user_id: req.user.sub.user_id } });
            globalThis.currentId = req.user.sub.user_id;
            // check user still exists
            if (!user)
                return res.status(401).json(responseApi(401, '', 'Unauthorized'));

            // authorization successful
            req.user = user.get();
            next();
        }
    ];
}

function responseApi(code, data, message){
    return {
        code: code,
        data: data,
        message: message
    }
}