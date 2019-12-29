var express = require("express");
var router = express.Router();

var moment = require('moment')

const defaultRes = require("../../../module/utils/utils");
const statusCode = require("../../../module/utils/statusCode");
const resMessage = require("../../../module/utils/responseMessage");
const db = require("../../../module/pool");

router.get('/profile', async (req, res) => {
    const selectExpertQuery = 'SELECT * FROM Expert ORDER BY experience DESC LIMIT 3'; //카테고리에서 조회수 제일 높은 3개만 뽑기
    const selectExpertResult = await db.queryParam_None(selectExpertQuery)

    if (!selectExpertResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "전문가 프로필 전체 조회 성공", selectExpertResult));    // 작품 삭제 성공
})

router.post('/profile', async (req, res) => {
    const insertExpertQuery = 'INSERT INTO Expert (category, name, experience, description) VALUES (?, ?, ?, ?)';
    const insertExpertResult = await db.queryParam_Arr(insertExpertQuery,[req.body.category, req.body.name, req.body.experience, req.body.description])
    
    if (!insertExpertResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else   
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "전문가 프로필 입력 성공"));    // 작품 삭제 성공
})


router.get('/notice', async (req, res) => {

        const selectExpertQuery = 'SELECT * FROM ExpertNotice';
        const selectExpertResult = await db.queryParam_None(selectExpertQuery)
    
        if (!selectExpertResult)
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));
        else
            res.status(200).send(defaultRes.successTrue(statusCode.OK, "필독사항 조회 성공", selectExpertResult));    // 작품 삭제 성공
})

router.post('/notice', async (req, res) => {
    const insertLawQuery = 'INSERT INTO ExpertNotice (title, contents) VALUES (?, ?)';
    const insertLawResult = await db.queryParam_Arr(insertLawQuery,[req.body.title, req.body.contents])
    
    if (!insertLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else   
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "필독사항 등록 성공"));    // 작품 삭제 성공
})

module.exports = router;