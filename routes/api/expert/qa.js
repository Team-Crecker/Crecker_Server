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
const notifyMessage = require('../../../module/utils/notifyMessage')
const common = require('../../../module/common');
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
    const selectQaQuery = `SELECT expertConsultIdx, userIdx ,categoryCode, Qtitle, Qcontent, isComplete, isSecret, views ,createAt, answerUpdateAt FROM ExpertConsult WHERE categoryCode = '0201' ORDER BY AnswerUpdateAt DESC `;
    
    // const selectQaResult1 = await connection.query(selectQaQuery);

    const selectQaResult = await db.queryParam_None(selectQaQuery)
    let resData = [];
    resData = selectQaResult.map(element => {
        return {...element, categoryCode: common.changeENGName(categoryCode) ,isOkConsult: element.userIdx == req.decoded.idx ? true : false ,createAt : parseInt(moment(element.createAt).format('YYMMDD')), 'answerUpdateAt' : parseInt(moment(element.answerUpdateAt).format('YYMMDD'))}
    })
    console.log(resData);
    if (!selectQaResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR)); // 작품 삭제 실패
    else if (resData.length == 0)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EXPERT_QUESTION_SUCCESS, resData));    // 작품 삭제 성공
});

router.get("/posted", isLoggedin , async function(req, res) { //내 질문
    const userIdx = req.decoded.idx;    
    const selectQaQuery = `SELECT expertConsultIdx, Qtitle, Qcontent, isComplete, isSecret, views ,createAt, answerUpdateAt FROM ExpertConsult WHERE userIdx = ${userIdx} AND isComplete IS NULL ORDER BY views DESC`;
    const selectQaResult = await db.queryParam_None(selectQaQuery)

    if (!selectQaResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EXPERT_QUESTION_SUCCESS, selectQaResult));    // 작품 삭제 성공

});

router.get("/answered", isLoggedin ,async function(req, res) { //내 답변
    const userIdx = req.decoded.idx;    
    const selectQaQuery = `SELECT expertConsultIdx, Qtitle, Qcontent,isComplete, isSecret, views , createAt, answerUpdateAt FROM ExpertConsult WHERE userIdx = ${userIdx} AND isComplete IS NOT NULL ORDER BY views DESC`;

    const selectQaResult = await db.queryParam_None(selectQaQuery)

    if (!selectQaResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EXPERT_ANSWER_SUCCESS, selectQaResult));    // 작품 삭제 성공

});

router.get("/consulted", isLoggedin , async function(req, res) { // 상담 신청 내역 수정 요망
    const userIdx = req.decoded.idx;    
    const selectQaQuery = `SELECT a.expertIdx, a.name, a.experience, a.description, a.photo , b.Cdate, b.isSuccess FROM Expert AS a JOIN ExpertConsult AS b ON a.expertIdx = b.expertIdx WHERE b.userIdx = ${userIdx} AND b.Cdate IS NOT NULL;`
    const selectQaResult = await db.queryParam_None(selectQaQuery)
    console.log(selectQaResult)
    
    let resData = [];
    resData = selectQaResult.map(element => {
        return {...element, 'Cdate': moment(element.Cdate).format('YYYYMM')}
    })

    if (!selectQaResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EXPERT_CONSULT_SUCCESS, resData));    // 작품 삭제 성공

});

router.get("/law/:idx", isLoggedin ,async function(req, res) {
    //질문 답변 개별 조회
    const {idx}  = req.params; 
    const myIdx = req.decoded.idx;
    const selectFirstQuery = `SELECT expertConsultIdx, expertIdx,userIdx ,Qtitle,Qcontent,categoryCode,isSecret,createAt FROM ExpertConsult WHERE expertConsultIdx = ${idx};`
    const updateQaQuery = `UPDATE ExpertConsult SET views = views +1 WHERE expertConsultIdx = ${idx}`;
    let selectFirstResult = await db.queryParam_None(selectFirstQuery);

    if (!selectFirstResult[0].expertIdx == "") {
    const selectQaQuery = `SELECT b.expertConsultIdx, b.userIdx, a.expertIdx, a.name, a.description, a.photo, b.categoryCode, b.Qtitle, b.Qcontent, b.Acontent ,b.isComplete, b.isSecret, b.views ,b.createAt, b.answerUpdateAt FROM Expert AS a JOIN ExpertConsult AS b ON a.expertIdx = b.expertIdx WHERE b.expertConsultIdx = ${idx};`
    
    let selectQaResult;
    let resData = [];
    let userIdxAd;
    const selectTransaction = await db.Transaction(async connection => {
        const updateQaResult = await connection.query(updateQaQuery);
        selectQaResult = await connection.query(selectQaQuery);
        userIdxAd = selectQaResult[0].userIdx;
        const isOkConsult = (myIdx === userIdxAd) ? true : false;
        const selectQuery = `SELECT email FROM User WHERE userIdx=${userIdxAd}`
        const selectResult = await connection.query(selectQuery);
        
        resData = selectQaResult.map(element => {
            return {...element, categoryCode: common.changeENGName(element.categoryCode)  , isOkConsult: isOkConsult ,email: selectResult[0].email,'createAt' : moment(element.createAt).format('YY.MM.DD'), 'answerUpdateAt' : moment(element.answerUpdateAt).format('YY.MM.DD')}
        })
        
    });
    if (!selectTransaction)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 실패
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EXPERT_QUESTION_SUCCESS, resData));    // 작품 삭제 성공
    }
        else {

                let resData = [];
                let userIdxAd;
            
                const updateQaResult = await db.queryParam_None(updateQaQuery);
                userIdxAd = selectFirstResult[0].userIdx;
                const isOkConsult = (myIdx === userIdxAd) ? true : false;
                const selectQuery = `SELECT email FROM User WHERE userIdx=${userIdxAd}`
                const selectResult = await db.queryParam_None(selectQuery);
                
                resData = selectFirstResult.map(element => {
                    return {...element, isOkConsult: isOkConsult ,email: selectResult[0].email,'createAt' : moment(element.createAt).format('YY.MM.DD'), 'answerUpdateAt' : moment(element.answerUpdateAt).format('YY.MM.DD')}
                })
                

        if (!updateQaResult || !selectFirstResult || !selectResult)
            res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 실패    
        else
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EXPERT_QUESTION_SUCCESS, resData));    // 작품 삭제 성공
        }
});


router.post("/law", isLoggedin , async function(req, res) {
    // 질문하기
    const {Qtitle, Qcontent, isSecret} = req.body;
    const userIdx = req.decoded.idx;
    const insertQaQuery = 'INSERT INTO ExpertConsult (userIdx ,Qtitle,Qcontent,categoryCode,isSecret,createAt) VALUES (?, ?,?,?,?,?)'; //category 1 == Law
    const insertQaResult = await db.queryParam_Arr(insertQaQuery, [userIdx, Qtitle , Qcontent, '0201' , isSecret,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertQaResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_EXPERT_QUESTION_SUCCESS));    // 작품 삭제 성공
    
});

router.put("/law" , async (req, res) => {
    // 전문가 답변
    const {expertConsultIdx, Acontent, expertIdx} = req.body;
    const updateQaQuery = `UPDATE ExpertConsult SET Acontent = ?, isComplete = ?, answerUpdateAt = ?, expertIdx= ? WHERE expertConsultIdx=?`; // 답변 완료
    const updateQaResult = await db.queryParam_Arr(updateQaQuery, [Acontent, 1, moment().format('YYYY-MM-DD HH:mm:ss'), expertIdx ,expertConsultIdx]);
    
    const insertNotifyQuery = `INSERT INTO Notification (categoryCode, notiContent, thumbnail, userIdx ,createAt) VALUES (?,?,?,?,?)`;
    const selectExpertQuery = `SELECT categoryCode, photo FROM Expert WHERE expertIdx=${expertIdx}`;
    const selectUserQuery = `SELECT userIdx FROM ExpertConsult WHERE expertConsultIdx = ${expertConsultIdx}`
    const selectUserResult = await db.queryParam_None(selectUserQuery);
    const selectExpertResult = await db.queryParam_None(selectExpertQuery);
    
    const insertNotifyResult = await db.queryParam_Arr(insertNotifyQuery, [selectExpertResult[0].categoryCode, notifyMessage.ANSWERED, selectExpertResult[0].photo, selectUserResult[0].userIdx ,moment().format('YYYY-MM-DD HH:mm:ss')]);


    if (!updateQaResult || !selectUserResult || !selectExpertResult || !insertNotifyResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else   
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_EXPERT_ANSWER_SUCCESS));    // 작품 삭제 성공

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

    const insertNotifyQuery = `INSERT INTO Notification (categoryCode, notiContent, thumbnail, userIdx ,createAt) VALUES (?,?,?,?,?)`;
    const selectExpertConsultQuery = `SELECT expertIdx FROM ExpertConsult WHERE expertConsultIdx = ${expertConsultIdx}`
    const selectExpertConsultResult = await db.queryParam_None(selectExpertConsultQuery);

    console.log(selectExpertConsultResult);
    const selectNotifyQuery = `SELECT photo FROM Expert WHERE expertIdx=${selectExpertConsultResult[0].expertIdx}`;
    const selectNotifyResult = await db.queryParam_None(selectNotifyQuery);
    
    const insertNotifyResult = await db.queryParam_Arr(insertNotifyQuery, ['0201', '상담 신청이 완료 되었습니다.', selectNotifyResult[0].photo, req.decoded.idx ,moment().format('YYYY-MM-DD HH:mm:ss')]);


    if (!updateLawResult || !selectExpertConsultResult || !selectNotifyResult || !insertNotifyResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_EXPERT_CONSULT_SUCCESS));    // 작품 삭제 성공
});

// INSERT, UPDATE, DELETE 가 한 라우트에 2개 이상이면 트랜젝션으로 묶는다.
// 답변 등록은 Postman으로 직접 등록
// 답변이 등록 되어있으면 안되게 해야하는데, 클라이언트와 협의하기

module.exports = router;
