// router.use('/qa/apply')
// put -> 상담 신청

var express = require("express");
var router = express.Router();

var moment = require('moment')

const defaultRes = require("../../../module/utils/utils");
const statusCode = require("../../../module/utils/statusCode");
const resMessage = require("../../../module/utils/responseMessage");
const db = require("../../../module/pool");
const isLoggedin = require('../../../module/utils/authUtils').isLoggedin;
/*   
    idx
    제목
    내용(string)
    private(0,1)
    createAt
*/
/*
    페이로드에 자주 쓰는 정보들을 집어넣어서 인증 할 때 마다, 유저정보를 사용하는데 도움이 되게 할 수 있다.

*/

/* GET home page. */

router.get("/law", isLoggedin ,async function(req, res) {//질문
    const selectQaQuery = `SELECT expertConsultIdx, categoryCode, Qtitle, Qcontent, isComplete, isSecret, views ,createAt, answerUpdateAt FROM ExpertConsult WHERE categoryCode = '0201' ORDER BY AnswerUpdateAt DESC `;

    const selectQaResult = await db.queryParam_None(selectQaQuery)
    let resData = [];
    resData = selectQaResult.map(element => {
        return {...element, 'createAt' : moment(element.createAt).format('YY.MM.DD'), 'answerUpdateAt' : moment(element.answerUpdateAt).format('YY.MM.DD')}
    })
    
    if (!selectQaResult)
        res.status(500).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다")); // 작품 삭제 실패
    else if (resData.length == 0)
        res.status(400).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 문의 정렬별 조회 성공", resData));    // 작품 삭제 성공
});

router.get("/posted", isLoggedin , async function(req, res) { //내 질문
    const userIdx = req.decoded.idx;    
    const selectQaQuery = `SELECT expertConsultIdx, Qtitle, Qcontent, isComplete, isSecret, views ,createAt, answerUpdateAt FROM ExpertConsult WHERE user = ${userIdx} AND isComplete IS NULL ORDER BY views DESC`;

    const selectQaResult = await db.queryParam_None(selectQaQuery)

    if (!selectQaResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 유저 문의 조회 성공", selectQaResult));    // 작품 삭제 성공

});

router.get("/answered", isLoggedin ,async function(req, res) { //내 답변
    const userIdx = req.decoded.idx;    
    const selectQaQuery = `SELECT expertConsultIdx, Qtitle, Qcontent, isComplete, isSecret, views , createAt, answerUpdateAt FROM ExpertConsult WHERE user = ${userIdx} AND isComplete IS NOT NULL ORDER BY views DESC`;

    const selectQaResult = await db.queryParam_None(selectQaQuery)

    if (!selectQaResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 유저 문의 조회 성공", selectQaResult));    // 작품 삭제 성공

});

router.get("/consulted", isLoggedin , async function(req, res) { // 상담 신청 내역 수정 요망
    const userIdx = req.decoded.idx;    
    const selectQaQuery = `SELECT a.expertIdx, a.name, a.experience, a.description, a.photo , b.Cdate, b.isSuccess FROM Expert AS a JOIN ExpertConsult AS b ON a.expertIdx = b.expertIdx WHERE b.userIdx = ${userIdx} AND b.Cdate IS NOT NULL;`
    const selectQaResult = await db.queryParam_None(selectQaQuery)
    console.log(selectQaResult)
    
    let resData = [];
    resData = selectQaResult.map(element => {
        return {...element, 'Cdate': moment(element.Cdate).format('YY.MM.DD AHH')}
    })

    if (!selectQaResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 유저 문의 조회 성공", resData));    // 작품 삭제 성공

});

router.get("/law/:idx", isLoggedin ,async function(req, res) {
    //질문 답변 개별 조회
    const {idx}  = req.params; 

    const selectQaQuery = `SELECT b.expertConsultIdx, a.expertIdx, a.name, a.description, a.photo, b.categoryCode, b.Qtitle, b.Qcontent, b.Acontent ,b.isComplete, b.isSecret, b.views ,b.createAt, b.answerUpdateAt FROM Expert AS a JOIN ExpertConsult AS b ON a.expertIdx = b.expertIdx WHERE b.expertConsultIdx = ${idx};`
    const updateQaQuery = `UPDATE ExpertConsult SET views = views +1 WHERE expertConsultIdx = ${idx}`;
    
    let selectQaResult;
    let resData = [];
    const selectTransaction = await db.Transaction(async connection => {
        const updateQaResult = await connection.query(updateQaQuery);
        selectQaResult = await connection.query(selectQaQuery);
        resData = selectQaResult.map(element => {
            return {...element, 'createAt' : moment(element.createAt).format('YY.MM.DD'), 'answerUpdateAt' : moment(element.answerUpdateAt).format('YY.MM.DD')}
        })
        
    });
    if (!selectTransaction)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 문의 정렬별 조회 성공", resData));    // 작품 삭제 성공
});


router.post("/law", isLoggedin , async function(req, res) {
    // 질문하기
    const {Qtitle, Qcontent, categoryCode, isSecret} = req.body;
    const user = req.decoded.idx;
    const insertQaQuery = 'INSERT INTO ExpertConsult (userIdx ,Qtitle,Qcontent,categoryCode,isSecret,createAt) VALUES (?, ?,?,?,?,?)'; //category 1 == Law
    const insertQaResult = await db.queryParam_Arr(insertQaQuery, [user, Qtitle , Qcontent, categoryCode , isSecret,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertQaResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법류 문의 입력 성공"));    // 작품 삭제 성공
    
});

router.put("/law" , isLoggedin , async (req, res) => {
    // 전문가 답변
    const {expertConsultIdx, Acontent, isComplete} = req.body;
    const expertIdx = req.decoded.idx;
    const updateQaQuery = `UPDATE ExpertConsult SET Acontent = ?, isComplete = ?, answerUpdateAt = ?, expertIdx= ? WHERE expertConsultIdx=?`; // 답변 완료
    const updateQaResult = await db.queryParam_Arr(updateQaQuery, [Acontent, isComplete, moment().format('YYYY-MM-DD HH:mm:ss'), expertIdx ,expertConsultIdx]);
    
    if (!updateQaResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else   
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 답변 입력 성공"));    // 작품 삭제 성공

});

/*
    Cdate = 'yyyy/ mm/ dd'
    Ctime = 'a hh : mm'
*/

router.put("/apply" , isLoggedin , async function(req, res) {
    // 상담 신청
    console.log(req.body)
    const {name, Cdate, Ctime, expertConsultIdx, Ccontent} = req.body;
    const user = req.decoded.idx;
    const updateLawQuery = `UPDATE ExpertConsult SET name = ?, Cdate = ?, isSuccess = ?, consultUpdateAt = ?, Ccontent = ? WHERE expertConsultIdx = ?`; // 답변 완료
    const updateLawResult = await db.queryParam_Arr(updateLawQuery, [name ,moment(Cdate+Ctime, 'YYYY/ MM/ DDA hh : mm').format('YYYY-MM-DD HH:mm:ss'), 1, moment().format('YYYY-MM-DD HH:mm:ss'), Ccontent,expertConsultIdx])

    if (!updateLawResult)
        res.status(500).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 상담 입력 성공"));    // 작품 삭제 성공
});

// INSERT, UPDATE, DELETE 가 한 라우트에 2개 이상이면 트랜젝션으로 묶는다.
// 답변 등록은 Postman으로 직접 등록
// 답변이 등록 되어있으면 안되게 해야하는데, 클라이언트와 협의하기

module.exports = router;
