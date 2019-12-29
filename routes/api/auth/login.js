var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');

const jwtUtils = require('../../../module/jwt');

router.post('/', async (req, res) => {
    email = req.body.email;
    password = req.body.password

    const selectUserQuery = 'SELECT * FROM User WHERE email = ?'
    const selectUserResult = await db.queryParam_Parse(selectUserQuery, email);

    if (selectUserResult[0] == null) {
        // 아이디가 존재하지 않으면
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.ID_NO));
    } else {
        const salt = selectUserResult[0].salt;
        const hashedEnterPw = await crypto.pbkdf2(password, salt, 1000, 32, 'SHA512')
        const dbPw = selectUserResult[0].password

        if (hashedEnterPw.toString('base64') == dbPw) {
            const tokens = jwtUtils.sign(selectUserResult[0]);
            const accessToken = tokens.token;
            const refreshToken = tokens.refreshToken;
            const TokenUpdateQuery = "UPDATE User SET accessToken = ?, refreshToken = ? WHERE email= ?";
            const TokenUpdateResult = await db.queryParam_Parse(TokenUpdateQuery, [accessToken, refreshToken, email]);
            if (!TokenUpdateResult) {
                res.status(200).send(defaultRes.successTrue(statusCode.DB_ERROR, "refreshtoken DB등록 오류 "));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS, {
                    tokens
                }));
            }
        } else {
            //비밀번호가 일치하지 않음
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.PASSWORD_NO));
        }
    }
});

module.exports = router;