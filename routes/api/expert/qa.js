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

router.get("/:category/:type", async function(req, res) {
    //답변순, 등록순, 조회순
    const category  = req.params.category;
    const type = req.params.type; //1은 답변순
    let selectLawQuery;
    if(type == 1) { //답변순
        selectLawQuery = `SELECT * FROM ExpertConsult WHERE category = ${category} ORDER BY AnswerUpdateAt DESC `;
    }
    else if (type == 2) { //등록순 
        selectLawQuery = `SELECT * FROM ExpertConsult WHERE category = ${category} ORDER BY createAt DESC`;
    }
    else if(type == 3) { //조회순 
        selectLawQuery = `SELECT * FROM ExpertConsult WHERE category = ${category} ORDER BY views DESC`;
    }

    const selectLawResult = await db.queryParam_None(selectLawQuery)

    if (!selectLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 문의 정렬별 조회 성공", selectLawResult));    // 작품 삭제 성공

});

router.get("/:category/:type/:idx", async function(req, res) {
    //답변순, 등록순, 조회순
    const {category, type, idx}  = req.params; 
    
    const selectLawQuery = `SELECT * FROM ExpertConsult WHERE expertConsultIdx = ${idx}`;
    const updateLawQuery = `UPDATE ExpertConsult SET views = views +1 WHERE expertConsultIdx = ${idx}`;
    
    let selectLawResult;
    const selectTransaction = await db.Transaction(async connection => {
        const updateLawResult = await connection.query(updateLawQuery);
        selectLawResult = await connection.query(selectLawQuery);
        
    });
    console.log(selectLawResult.Cdate, selectLawResult.Ctime);
    if (!selectTransaction)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 문의 정렬별 조회 성공", selectLawResult));    // 작품 삭제 성공

});


router.post("/", async function(req, res) {
    // 질문하기
    const {Qtitle, Qcontent, category, isSecret} = req.body;
    const user = req.decoded.idx;
    const insertLawQuery = 'INSERT INTO ExpertConsult (user,Qtitle,Qcontent,category,isSecret,createAt) VALUES (?, ?,?,?,?,?)'; //category 1 == Law
    const insertLawResult = await db.queryParam_Arr(insertLawQuery, [user, Qtitle , Qcontent, category , isSecret,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법류 문의 입력 성공"));    // 작품 삭제 성공
    
});

router.put("/" , async (req, res) => {
    // 전문가 답변
    const {expertConsultIdx,Atitle, Acontent, isComplete} = req.body;
    const user = req.decoded.idx;
    const updateLawQuery = `UPDATE ExpertConsult SET Atitle = ? , Acontent = ?, isComplete = ?, answerUpdateAt = ? WHERE expertConsultIdx=?`; // 답변 완료
    const updateLawResult = await db.queryParam_Arr(updateLawQuery, [Atitle, Acontent, isComplete, moment().format('YYYY-MM-DD HH:mm:ss'), expertConsultIdx]);
    
    if (!updateLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else   
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 답변 입력 성공"));    // 작품 삭제 성공

});

/*
    Cdate = 'yyyy/ mm/ dd'
    Ctime = 'a hh : mm'
*/

router.put("/apply" ,async function(req, res, next) {
    // 상담 신청
    const {Cdate, Ctime, isSuccess, expertConsultIdx} = req.body;
    const user = req.decoded.idx;
    const updateLawQuery = `UPDATE ExpertConsult SET Cdate = ?, isSuccess = ?, consultUpdateAt = ? WHERE expertConsultIdx = ?`; // 답변 완료
    const updateLawResult = await db.queryParam_Arr(updateLawQuery, [moment(Cdate+Ctime, 'YYYY/ MM/ DDa hh : mm').format('YYYY-MM-DD HH:mm:ss'), isSuccess, moment().format('YYYY-MM-DD HH:mm:ss'), expertConsultIdx])

    if (!updateLawResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "법률 상담 입력 성공"));    // 작품 삭제 성공
});

// INSERT, UPDATE, DELETE 가 한 라우트에 2개 이상이면 트랜젝션으로 묶는다.
// 답변 등록은 Postman으로 직접 등록
// 답변이 등록 되어있으면 안되게 해야하는데, 클라이언트와 협의하기

module.exports = router;
