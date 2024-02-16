const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const uid = require('uid');
const { cloneDeep } = require('lodash');
const mailer = require('mail/mailer');
const mailConfig = require('mail.config.json');
const { secret } = require('config.json');
module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    resetPassword,
    resetNewPassword
};

function getHtml(tagAHtml) {
    const html = `
        <!doctype html>
        <html lang="en-US">

        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Reset Password Email Template</title>
            <meta name="description" content="Reset Password Email Template.">
            <style type="text/css">
                a:hover {text-decoration: underline !important;}
            </style>
        </head>

        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
            <!--100% body table-->
            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                <tr>
                    <td>
                        <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                            align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                            <tr>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>
                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:0 35px;">
                                                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                    requested to reset your password</h1>
                                                <span
                                                    style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                    We cannot simply send you your old password. A unique link to reset your
                                                    password has been generated for you. To reset your password, click the
                                                    following link and follow the instructions.
                                                </p>
                                                ${tagAHtml}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="text-align:center;">
                                    <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>Design by QuanTV</strong></p>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <!--/100% body table-->
        </body>

        </html>`;
    return html;
}

async function authenticate({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const newUser = cloneDeep(user);
    newUser['hash'] = undefined;
    const token = jwt.sign({ sub: newUser }, config.secret, { expiresIn: '1d' });
    const data = { ...omitHash(user.get()), token };
    return {
        code: 200,
        data: data,
        message: 'Xác thực thành công'
    }
}

async function getAll() {
    return {
        code: 200,
        data: await db.User.findAll({
            order: [['createdAt', 'DESC']], // Order by createdAt in descending order
          }),
        message: 'Request success'
    }
}

// {
//     order: [['createdAt', 'DESC']], // Order by createdAt in descending order
//     offset: 2,
//     limit: 2,
//   }

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }
    params['user_id'] = uid.uid(16)

    // save user
    await db.User.create(params);
    delete params.password;
    delete params.hash;
    return params;
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    // const user = await db.User.findByPk(id);
    const user = await db.User.findOne({ where: { user_id: id } });
    if (!user) throw 'User not found';
    return user
}

async function resetPassword(body) {
    const email = body.email;
    if (await db.User.findOne({ where: { email: email } })) {
        const tokenReset = jwt.sign({ sub: email }, config.secret, { expiresIn: '5m' });
        const html = `<a href="${mailConfig.SITE_URL + 'new-password'}?email=${email}&token=${tokenReset}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset Password</a>`;
        mailer.sendMail(email, "Reset Password", getHtml(html));
        return {
            code: 200,
            message: 'Gửi yêu cầu thành công'
        }
    }
    return {
        code: 400,
        message: 'Tài khoản chưa đăng kí'
    }

}

async function resetNewPassword(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            throw 'Error 401';
        } else {
            const email = decoded.sub;
            const newPass = req.body.password;
            const user = await db.User.findOne({ where: { email: email } });
            if (!user) {
                throw 'User not found!'
            }
            const params = {};
            params['hash'] = await bcrypt.hash(newPass, 10);

            // copy params to user and save
            Object.assign(user, params);
            await user.save();
            return {
                code: 200,
                message: 'Password has reset successfully!'
            }
        }
    });
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}