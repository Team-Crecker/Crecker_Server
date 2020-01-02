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

router.get('/daily/:idx', isLoggedin, async (req, res) => { 
    const {idx} = req.params.idx;
    const selectDailyQuery = `SELECT * FROM DailyNews WHERE dailyIdx=${idx}`;
    const selectDailyResult = await db.queryParam_None(selectDailyQuery);

    if (!selectDailyResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "데일리 뉴스 조회 성공", selectDailyResult));    // 작품 삭제 성공 
});


router.get('/support/:idx', isLoggedin, async (req, res) => { 
    const selectNewsQuery = `SELECT * FROM SupportNews WHERE newsIdx=${idx}`;
    const updateNewsQuery = `UPDATE SupportNews SET views = views+1 WHERE newsIdx=${idx}`;
    
    let selectNewsResult;
    const selectTransaction = db.Transaction( async connection => {
    const updateNewsResult = await db.queryParam_None(updateNewsQuery);
    selectNewsResult = await db.queryParam_None(selectNewsQuery)
    });

    if (!selectTransaction)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 조회 성공", selectNewsResult));    // 작품 삭제 성공

})

router.get('/daily', isLoggedin ,async (req, res) => { 
    const selectNewsQuery = 'SELECT * FROM DailyNews WHERE ORDER BY createAt DESC';
    const selectNewsResult = await db.queryParam_None(selectNewsQuery)

    if (!selectNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 조회 성공", selectNewsResult));    // 작품 삭제 성공
})

router.get('/support', isLoggedin ,async (req, res) => { 
    const selectNewsQuery = 'SELECT * FROM SupportNews ORDER BY calendarStart ASC';
    const selectNewsResult = await db.queryParam_None(selectNewsQuery)

    if (!selectNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 조회 성공", selectNewsResult));    // 작품 삭제 성공
})

router.get('/recommand/:flag', isLoggedin, async (req, res) => { 
    let selectNewsQuery;
    if (req.params.flag == 0) //인기 뉴스
        selectNewsQuery = 'SELECT * FROM SupportNews ORDER BY views DESC';
    else if (req.params.flag == 1) //최신 뉴스
        selectNewsQuery = 'SELECT * FROM SupportNews ORDER BY calendarStart ASC';
    const selectNewsResult = await db.queryParam_None(selectNewsQuery);

    if (!insertNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 조회 성공", selectNewsResult));    // 작품 삭제 성공 
})

router.post("/support", isLoggedin ,upload.single('poster'), async (req, res) => {
    const insertNewsQuery = 'INSERT INTO SupportNews (poster, category ,host, title, subtitle ,contents, calendarStart, calendarEnd ,createAt) VALUES (?,?,?,?,?,?,?,?,?)';
    const insertNewsResult = await db.queryParam_Arr(insertNewsQuery, [req.file.location, req.body.category ,req.body.host, req.body.title, req.body.subtitle ,req.body.contents, req.body.calendarStart, req.body.calendarEnd ,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 입력 성공"));    // 작품 삭제 성공
});

router.post("/daily" , upload.single('thumbnail'), async (req, res) => {
    const insertDailyQuery = 'INSERT INTO DailyNews (thumbnail, title ,subtitle, content, createAt) VALUES (?,?,?,?,?)';
    const insertDailyResult = await db.queryParam_Arr(insertDailyQuery, [req.file.location, req.body.title ,req.body.subtitle, req.body.content, ,moment().format('YYYY-MM-DD HH:mm:ss') ])

    const selectDailyQuery = `SELECT dailyIdx FROM DailyNews WHERE thumbnail = '${req.file.location}'`;
    const selectDailyResult = await db.queryParam_None(selectDailyQuery);

    // const insertNotifyQuery = `INSERT INTO Notification (categoryCode, notiContent, thumbnail, userIdx ,createAt) VALUES (?,?,?,?,?)`;
    // const selectNotifyQuery = `SELECT thumbnail FROM DailyNews WHERE dailyIdx=${selectDailyResult[0].dailyIdx}`;
    // const selectNotifyResult = await db.queryParam_None(selectNotifyQuery);
    
    // const insertNotifyResult = await db.queryParam_Arr(insertNotifyQuery, ['0301', '데일리 뉴스가 업데이트 되었습니다', selectNotifyResult[0].thumbnail, req.decoded.idx ,moment().format('YYYY-MM-DD HH:mm:ss')]);

    if (!insertDailyResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 입력 성공"));    // 작품 삭제 성공
});

router.post("/scrap", isLoggedin ,async (req, res) => {
    const userIdx = req.decoded.idx;
    const insertNewsQuery = `INSERT INTO UserNews (userIdx, newsIdx, isScrapped) VALUES (?,?,?)`;
    const insertNewsResult = await db.queryParam_Arr(insertNewsQuery, [userIdx ,req.body.newsIdx, 1])

    if (!insertNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 입력 성공"));    // 작품 삭제 성공
});

module.exports = router;

