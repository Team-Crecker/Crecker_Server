const express = require('express');
const router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const authUtil = require("../../../module/utils/authUtils");

const upload = require('../../../config/multer');

router.get('/profile', authUtil.isLoggedin ,async (req, res) => { //프로필 사진, 이름, 채널명, 주소, 연락처 : params로 유저 인덱스 받기? no?
    const idx = req.decoded.idx
    const selectUserQuery = `SELECT profileImage, name, channelName, cash FROM User WHERE userIdx = ${idx}`;
    const selectUserResult = await db.queryParam_None(selectUserQuery);

    if (!selectUserResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR)) 
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_SUCCESS,  selectUserResult))
})

router.get('/', authUtil.isLoggedin ,async (req, res) => { //프로필 사진, 이름, 채널명, 주소, 연락처 : params로 유저 인덱스 받기? no?
    const idx = req.decoded.idx
    const selectUserQuery = `SELECT profileImage, phone, location FROM User WHERE userIdx = ${idx}`;
    const selectUserResult = await db.queryParam_None(selectUserQuery);


    if (!selectUserResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR)) 
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_SUCCESS,  selectUserResult))
})

router.get('/interest', authUtil.isLoggedin ,async (req, res) => { //관심사 조회
    const idx = req.decoded.idx
    const selectUserQuery = `SELECT typeAd, typeExpert, typeNews FROM User WHERE userIdx = ${idx}`;
    const selectUserResult = await db.queryParam_None(selectUserQuery);

    if (!selectUserResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR)) 
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_INTEREST_SUCCESS,  selectUserResult))
})
router.put('/', authUtil.isLoggedin , upload.single('profileImage') ,async (req, res) => {
    const {phone, location} = req.body;
    const profileImage = req.file.location || 'https://crecker1.s3.ap-northeast-2.amazonaws.com/default_image.png';
    const idx = req.decoded.idx
    // console.log(req.file)
    // console.log(req.body)
    const updateUserQuery = `UPDATE User SET profileImage = '${profileImage}' ,phone='${phone}', location='${location}'  WHERE userIdx = ${idx}`;
    const updateUserResult = await db.queryParam_None(updateUserQuery);

    if (!updateUserResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR)) 
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.UPDATE_USER_SUCCESS))
})
router.put('/interest', authUtil.isLoggedin ,async (req, res) => { //관심사 디비 수정 요망
    const {typeAd, typeExpert, typeNews} = req.body;
    const idx = req.decoded.idx
    const updateUserQuery = `UPDATE User SET typeAd='${typeAd}', typeExpert='${typeExpert}', typeNews='${typeNews}'  WHERE userIdx = ${idx}`;
    const updateUserResult = await db.queryParam_None(updateUserQuery);

    if (!updateUserResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR)) 
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.UPDATE_USER_INTEREST_SUCCESS))
})

module.exports = router;
