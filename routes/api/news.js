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
DB 오류 뜰 때
    ? 개수
404 에러
    1. GET, POST 확인하기
    2. 라우팅 제대로 되었는지 확인하기
*/
const changeLang = element => {
    const time = moment(element.createAt).diff(moment(), 'days');
    return {...element, createAt: (time <= 1 && time >= 0) ? moment(element.createAt).fromNow() : moment(element.createAt).format('YY.MM.DD')} 
}

router.get('/card', isLoggedin ,async (req, res) => { 
    const selectNewsQuery = 'SELECT dailyIdx,thumbnail,createAt FROM DailyNews ORDER BY createAt DESC LIMIT 5';
    const selectNewsResult = await db.queryParam_None(selectNewsQuery)
    moment.locale('ko')
    
    let resData = selectNewsResult.map(changeLang);


    if (!selectNewsResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_DAILYNEWS_SUCCESS, resData));    // 작품 삭제 성공
})

router.get('/daily/:idx', isLoggedin, async (req, res) => { 
    const idx = req.params.idx;
    const selectDailyQuery = `SELECT * FROM DailyNews WHERE dailyIdx=${idx}`;
    const selectDailyResult = await db.queryParam_None(selectDailyQuery);

    const resData = selectDailyResult.map(element => {
        return {...element, createAt: moment(element.createAt).format('YY.MM.DD'), updateAt: moment(element.updateAt).format('YY.MM.DD')}
    })

    if (!selectDailyResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_DAILYNEWS_SUCCESS, resData));    // 작품 삭제 성공 
});


router.get('/support/:idx', isLoggedin, async (req, res) => {
    const idx = req.params.idx; 
    const userIdx = req.decoded.idx;
    // const selectNewsQuery = `SELECT * FROM SupportNews WHERE newsIdx=${idx}`;
    const selectNewsQuery = `SELECT * FROM UserNews as a RIGHT JOIN SupportNews as b ON a.newsIdx=b.newsIdx WHERE b.newsIdx = ${idx}`
    const updateNewsQuery = `UPDATE SupportNews SET views = views+1 WHERE newsIdx=${idx}`;
    
    const updateNewsResult = await db.queryParam_None(updateNewsQuery);
    const selectNewsResult = await db.queryParam_None(selectNewsQuery)

    const resData = selectNewsResult.map(element => {
        return {...element, isScrapped: (element.isScrapped == "") ? false : true, dday: moment().diff(element.calendarEnd,'days'), createAt: moment(element.createAt).format('YY.MM.DD'), updateAt: moment(element.createAt).format('YY.MM.DD'), calendarStart: moment(element.calendarStart).format('YY.MM.DD'), calendarEnd: moment(element.calendarEnd).format('YY.MM.DD')}
    }) 

    if (!updateNewsResult || !selectNewsResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_SUPPORTNEWS_SUCCESS, resData));    // 작품 삭제 성공

})

router.get('/daily', isLoggedin ,async (req, res) => { 
    const selectNewsQuery = 'SELECT * FROM DailyNews ORDER BY createAt DESC';
    const selectNewsResult = await db.queryParam_None(selectNewsQuery)
    
    let resData = selectNewsResult.map(changeLang);

    if (!selectNewsResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_DAILYNEWS_SUCCESS, resData));    // 작품 삭제 성공
})

router.get('/support', isLoggedin ,async (req, res) => { 
    const selectNewsQuery = 'SELECT * FROM SupportNews ORDER BY calendarStart ASC';
    // const selectNewsQuery = `SELECT * FROM UserNews as a JOIN SupportNews as b ON a.newsIdx=b.newsIdx ORDER BY b.calendarEnd DESC`
    const selectNewsResult = await db.queryParam_None(selectNewsQuery)

    let resData = selectNewsResult.map(element => {
        return {...element, dday: moment().diff(element.calendarEnd,'days'), createAt: moment(element.createAt).format('YY.MM.DD'), updateAt: moment(element.createAt).format('YY.MM.DD'), calendarStart: moment(element.calendarStart).format('YY.MM.DD'), calendarEnd: moment(element.calendarEnd).format('YY.MM.DD')}
    })

    if (!selectNewsResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_SUPPORTNEWS_SUCCESS, resData));    // 작품 삭제 성공
})

router.get('/recommand/:flag', isLoggedin, async (req, res) => { 
    let selectNewsQuery;
    if (req.params.flag == 1) //인기 뉴스
        selectNewsQuery = 'SELECT * FROM SupportNews ORDER BY views DESC';
    else if (req.params.flag == 2) //최신 뉴스
        selectNewsQuery = 'SELECT * FROM SupportNews ORDER BY calendarStart ASC';
    const selectNewsResult = await db.queryParam_None(selectNewsQuery);

    const resData = selectNewsResult.map(element => {
        return {...element, dday: moment().diff(element.calendarEnd,'days'), createAt: moment(element.createAt).format('YY.MM.DD'), updateAt: moment(element.createAt).format('YY.MM.DD'), calendarStart: moment(element.calendarStart).format('YY.MM.DD'), calendarEnd: moment(element.calendarEnd).format('YY.MM.DD')}
    })
    if (!selectNewsResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_SUPPORTNEWS_SUCCESS, resData));    // 작품 삭제 성공 
})

router.post("/support", upload.single('poster'), async (req, res) => {
    const insertNewsQuery = 'INSERT INTO SupportNews (poster, host, title, subtitle ,contents, calendarStart, calendarEnd ,createAt) VALUES (?,?,?,?,?,?,?,?)';
    const insertNewsResult = await db.queryParam_Arr(insertNewsQuery, [req.file.location, req.body.host, req.body.title, req.body.subtitle ,req.body.contents, moment(req.body.calendarStart, 'YY.MM.DD').format('YYYY-MM-DD'), moment(req.body.calendarEnd, 'YY.MM.DD').format('YYYY-MM-DD') ,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertNewsResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_SUPPORTNEWS_SUCCESS));    // 작품 삭제 성공
});

router.post("/daily" , upload.single('thumbnail'), async (req, res) => {
    const insertDailyQuery = 'INSERT INTO DailyNews (thumbnail, title ,subtitle, content, createAt) VALUES (?,?,?,?,?)';
    const insertDailyResult = await db.queryParam_Arr(insertDailyQuery, [req.file.location, req.body.title ,req.body.subtitle, req.body.content, moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertDailyResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_DAILYNEWS_SUCCESS));    // 작품 삭제 성공
});

router.post("/scrap", isLoggedin ,async (req, res) => {
    const userIdx = req.decoded.idx;
    const insertNewsQuery = `INSERT INTO UserNews (userIdx, newsIdx, isScrapped) VALUES (?,?,?)`;
    const insertNewsResult = await db.queryParam_Arr(insertNewsQuery, [userIdx ,req.body.newsIdx, 1])

    if (!insertNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_USERNEWS_SUCCESS));    // 작품 삭제 성공
});

router.delete("/scrap", isLoggedin ,async (req, res) => {
    const {newsIdx} = req.body;
    const userIdx = req.decoded.idx;
    const deleteNewsQuery = `DELETE FROM UserNews WHERE userIdx=? AND newsIdx=?`;
    const deleteNewsResult = await db.queryParam_Arr(deleteNewsQuery, [userIdx , newsIdx])

    if (!deleteNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.DELETE_USERNEWS_SUCCESS));    // 작품 삭제 성공
});

module.exports = router;

