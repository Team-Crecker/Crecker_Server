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
    // const selectFaqQuery = `SELECT * FROM faq`;
    // const selectFaqResult = await db.queryParam_None(selectFaqQuery)
    const data = [{homeBannerIdx: 0, url: 'https://crecker1.s3.ap-northeast-2.amazonaws.com/img_home_main_1.png'}, {homeBannerIdx: 1, url : 'https://crecker1.s3.ap-northeast-2.amazonaws.com/img_home_main_2.png'}, {homeBannerIdx: 2, url: 'https://crecker1.s3.ap-northeast-2.amazonaws.com/img_home_main_3.png'}];
    const randomData = data[Math.floor(Math.random() * data.length)];
    const rand = parseInt(moment()) % 3;
    // console.log(rand)
    console.log(rand)
    if (!data)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_FAQ_SUCCESS, randomData));    // 작품 삭제 성공

})

// router.get('/:idx', isLoggedin ,async (req, res) => { 
//     const faqIdx = req.params.idx
//     const selectFaqQuery = `SELECT * FROM faq WHERE faqIdx=${faqIdx}`;
//     const selectFaqResult = await db.queryParam_None(selectFaqQuery)

//     if (!selectFaqResult)
//         res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
//     else
//         res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_FAQ_SUCCESS, selectFaqResult));    // 작품 삭제 성공
// })

// router.post("/", async (req, res) => {
//     const insertFaqQuery = 'INSERT INTO faq (title, content, createAt) VALUES (?,?,?)';
//     const insertFaqResult = await db.queryParam_Arr(insertFaqQuery, [req.body.title,req.body.content,moment().format('YYYY-MM-DD HH:mm:ss') ])

//     if (!insertFaqResult)
//         res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
//     else
//         res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_FAQ_SUCCESS));    // 작품 삭제 성공
// });

module.exports = router;

