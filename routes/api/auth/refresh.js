var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');

const jwtUtils = require('../../../module/jwt');

router.get('/', async (req, res) => {
    const refreshToken = req.headers.refreshtoken;
    const selectUserQuery = 'SELECT * FROM User WHERE refreshToken = ?';
    const selectUserResult = await db.queryParam_Parse(selectUserQuery, refreshToken);
    if (!selectUserResult) {// DB오류
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else {
        if (selectUserResult[0] == null) {
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_CORRECT_REFRESH_TOKEN_USER));
        } else {
            const newAccessToken = jwtUtils.refresh(selectUserResult[0]);
            console.log("newAccessToken: ", newAccessToken);
            res.status(statusCode.OK).send(defaultRes.successTrue(statusCode.OK, resMessage.REFRESH_TOKEN, newAccessToken));
        }

    }
});


module.exports = router;