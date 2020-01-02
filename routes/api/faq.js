var express = require("express");
var router = express.Router();

var moment = require('moment')
const upload = require('../../config/multer');

const defaultRes = require("../../module/utils/utils");
const statusCode = require("../../module/utils/statusCode");
const resMessage = require("../../module/utils/responseMessage");
const db = require("../../module/pool");
const isLoggedin = require('../../module/utils/authUtils').isLoggedin;
/*   
    idx
    제목
    내용(string)
    private(0,1)
    createAt
*/
/* GET home page. */
/*
DB 오류 뜰 때
    ? 개수
404 에러
    1. GET, POST 확인하기
    2. 라우팅 제대로 되었는지 확인하기
*/

router.get('/', isLoggedin, async (req, res) => { 
    const selectFaqQuery = `SELECT * FROM Faq`;
    const selectFaqResult = await db.queryParam_None(selectFaqQuery)

    if (!selectFaqResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "FAQ 전체 조회 성공", selectFaqResult));    // 작품 삭제 성공

})

router.get('/:idx', isLoggedin ,async (req, res) => { 
    const faqIdx = req.body.idx
    const selectFaqQuery = `SELECT * FROM Faq WHERE faqIdx=${faqIdx}`;
    const selectFaqResult = await db.queryParam_None(selectFaqQuery)

    if (!selectNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "FAQ 개별 조회 성공", selectFaqResult));    // 작품 삭제 성공
})

router.post("/", async (req, res) => {
    const insertFaqQuery = 'INSERT INTO Faq (title, content, createAt) VALUES (?,?,?)';
    const insertFaqResult = await db.queryParam_Arr(insertFaqQuery, [req.body.title,req.body.content,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertFaqResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "FAQ 입력 성공"));    // 작품 삭제 성공
});

module.exports = router;

