var express = require('express');
var router = express.Router();

const upload = require('../../../config/multer');
const crypto = require('crypto-promise');

const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');

router.get('/', async (req, res) => {
    const getUserQuery = 'SELECT * FROM User';
    const getUserResult = await db.queryParam_None(getUserQuery);
    console.log(getUserResult);
    if (!getUserResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SIGNUP_FAIL));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "매칭성공", getUserResult));
    }
});

router.post('/', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone;
    const location = req.body.location;
    const name = req.body.name;
    const channelName = req.body.channelName;
    const youtubeUrl = req.body.youtubeUrl;
    const agreement = req.body.agreement;
    const hashcode = "hashcode";
    const tokens = jwtUtils.sign(email);
    const accessToken = tokens.token;
    const refreshToken = tokens.refreshToken;
    const isAuth = 0
    const selectIdQuery = 'SELECT * FROM User WHERE email = ?'
    const selectIdResult = await db.queryParam_Parse(selectIdQuery, email);
    const signupQuery = 'INSERT INTO User (email, password, phone, location, name, channelName, youtubeUrl, agreement, hashcode, accessToken, refreshToken, salt, isAuth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    if (selectIdResult[0] == null) {
        console.log("일치 없음");
        const buf = await crypto.randomBytes(64);
        const salt = buf.toString('base64');
        const hashedPw = await crypto.pbkdf2(password.toString(), salt, 1000, 32, 'SHA512').toString('base64');
        
        const signupResult = await db.queryParam_Arr(signupQuery, [email, hashedPw, phone, location, name,
            channelName, youtubeUrl, agreement, hashcode, accessToken, refreshToken, salt, isAuth]);

        if (!signupResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SIGNUP_FAIL));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SIGNUP_SUCCESS, {'accessToken': accessToken, 'refreshToken': refreshToken}));
        }
    } else {
        console.log("이미 존재");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DUPLICATED_ID_FAIL));
    }
});
{/* <Buffer 41 87 79 28 23 50 eb a0 89 40 1c de 6d 31 8f 1e 84 e7 db 35 1d 61 49 f8 2c 4f 90 84 da 21 ef 75> */}
module.exports = router;