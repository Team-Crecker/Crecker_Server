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
/* GET home page. */

router.get("/", async function(req, res, next) {
    //다 보여주기
});

router.get("/:type", isLoggedin ,async function(req, res, next) {
    //답변순, 등록순, 조회순
    const type = req.params.type;
    let selectLawQuery;
    if(type == 1) { //답변순
        selectLawQuery = `SELECT * FROM Question WHERE category=1 ORDER BY answerTime DESC `;
    }
    else if (type == 1) { //등록순 
        selectLawQuery = `SELECT * FROM Question WHERE category=1 ORDER BY createAt DESC`;
    }
    else if(type == 1) { //조회순 
        selectLawQuery = `SELECT * FROM Question WHERE category=1 ORDER BY views DESC`;
    }

    const selectLawResult = await db.queryParam_None(selectLawQuery)

    console.log(selectLawResult)

    if (!selectLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 문의 조회 성공", selectLawResult));    // 작품 삭제 성공

});

router.post("/", isLoggedin, async function(req, res, next) {
    // 질문하기
    const insertLawQuery = 'INSERT INTO Question (title, category, contents, privateYN, answerYN, views ,createAt) VALUES (?, 1,?,?,?,?,?)'; //category 1 == Law
    const insertLawResult = await db.queryParam_Arr(insertLawQuery, [req.body.title, req.body.category ,req.body.contents, 0 , 0,0,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법류 문의 입력 성공"));    // 작품 삭제 성공
    
});

router.put("/", isLoggedin ,async function(req, res, next) {
    // 전문가 답변
    const insertLawQuery = 'INSERT INTO Answer (title, category ,contents, privateYN, createAt) VALUES (?, 1,?,?,?)';
    const updateLawQuery = `UPDATE Question SET answerYN = 1 WHERE questionIdx=${req.body.questionIdx}`; // 답변 완료
//sql문이나 DB 물어보기
    
    const insertTransaction = await db.Transaction( async (connection) => {

        const insertLawResult = await connection.query(insertLawQuery, [req.body.title, req.body.contents, req.body.privateYN, moment().format('YYYY-MM-DD HH:mm:ss') ])
        const updateLawResult = await connection.query(updateLawQuery);
        //트랜잭션 쿼리 질문하기

    }
    );
    if (!insertTransaction)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else   
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법류 문의 입력 성공"));    // 작품 삭제 성공

});

router.put("/apply", isLoggedin ,async function(req, res, next) {
    // 상담 신청
    const insertLawQuery = 'INSERT INTO Consult (consultDate, consultTime, contents ,createAt) VALUES (?,?,?,?)'; //category 1 == Law
    const insertLawResult = await db.queryParam_Arr(insertLawQuery, [req.body.consultDate ,req.body.consultTime ,req.body.contents , moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법류 상담 입력 성공"));    // 작품 삭제 성공
});

// INSERT, UPDATE, DELETE 가 한 라우트에 2개 이상이면 트랜젝션으로 묶는다.
// 답변 등록은 Postman으로 직접 등록
// 답변이 등록 되어있으면 안되게 해야하는데, 클라이언트와 협의하기

module.exports = router;
