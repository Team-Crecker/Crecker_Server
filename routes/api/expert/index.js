var express = require("express");
var router = express.Router();

var moment = require('moment')

const defaultRes = require("../../../module/utils/utils");
const statusCode = require("../../../module/utils/statusCode");
const resMessage = require("../../../module/utils/responseMessage");
const db = require("../../../module/pool");

/* GET home page. */
router.use("/law", require("./law"));

router.get('/', async (req, res) => {
    const selectExpertQuery = 'SELECT * FROM Expert ORDER BY experience'; //카테고리에서 조회수 제일 높은 3개만 뽑기
    const selectExpertResult = await db.queryParam_None(selectExpertQuery)

    if (!selectExpertResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "전문가 전체 조회 성공", selectExpertResult));    // 작품 삭제 성공
})

router.get('/notice', async (req, res) => {

        const selectExpertQuery = 'SELECT * FROM ExpertNotice';
        const selectExpertResult = await db.queryParam_None(selectExpertQuery)
    
        if (!selectExpertResult)
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
        else
            res.status(200).send(defaultRes.successTrue(statusCode.OK, "필독사항 조회 성공", selectExpertResult));    // 작품 삭제 성공
        
        
})

module.exports = router;
//localhost:3000/
