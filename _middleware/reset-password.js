const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorizeReset;

function authorizeReset() {
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),
        async (req, res, next) => {
            const user = await db.User.findOne({ where: { email: req.user.sub } });
            // check user still exists
            if (!user)
            return res.status(401).json(responseApi(401, '', 'Unauthorized Reset'));
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