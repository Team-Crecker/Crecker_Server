var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');

router.post('/', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone;
    const location = req.body.location;
    const name = req.body.name;
    const channelName = req.body.channelName;
    const youtubeUrl = req.body.youtubeUrl;
    const agreement = req.body.agreement;
    const interest = req.body.interest;
    // const typeAd = req.body.typeAd;
    // const typeExpert = req.body.typeExpert;
    // const typeNews = req.body.typeNews;

    const notRegisterUrl = "dhdhdhdhd";
    const isAuth = 0
    const selectIdQuery = 'SELECT * FROM User WHERE email = ?'
    const selectIdResult = await db.queryParam_Parse(selectIdQuery, email);
    const signupQuery = 'INSERT INTO User (email, password, phone, location, name, channelName, youtubeUrl, agreement, notRegisterUrl, salt, isAuth, typeAd, typeExpert, typeNews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // console.log(selectIdResult);
    if (selectIdResult[0] == null) {
        // console.log("일치 없음");
        const buf = await crypto.randomBytes(64);
        const salt = buf.toString('base64');
        const hashedPw = await crypto.pbkdf2(password, salt, 1000, 32, 'SHA512')
        const signupResult = await db.queryParam_Arr(signupQuery, [email, hashedPw.toString('base64'), phone, location, name,
            channelName, youtubeUrl, agreement, notRegisterUrl, salt, isAuth, interest[0], interest[1], interest[2]
        ]);

        if (!signupResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SIGNUP_FAIL));
        } else { //쿼리문이 성공했을 때

            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SIGNUP_SUCCESS));
        }
    } else {
        // console.log("이미 존재");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DUPLICATED_ID_FAIL));
    }
});

module.exports = router;