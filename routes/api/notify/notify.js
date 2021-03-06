var express = require("express");
var router = express.Router();

var moment = require('moment')

const defaultRes = require("../../../module/utils/utils");
const statusCode = require("../../../module/utils/statusCode");
const resMessage = require("../../../module/utils/responseMessage");
const db = require("../../../module/pool");
const isLoggedin = require('../../../module/utils/authUtils').isLoggedin;
/*   
    알림 생각 해보기
    광고 정보가 변경됨 <-> 

*/
/* GET home page. */

router.get("/", isLoggedin , async function(req, res) {
    //다 보여주기
    const selectNoticeQuery = `SELECT * FROM Notification WHERE userIdx = ${req.decoded.idx} ORDER BY createAt`;
    const selectNoticeResult = await db.queryParam_None(selectNoticeQuery);

    if (!selectNoticeResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_NOTIFICATION_SUCCESS, selectNoticeResult));    // 작품 삭제 성공
});

router.get("/length", isLoggedin , async function(req, res) {
    //다 보여주기
    const selectNoticeQuery = `SELECT * FROM Notification WHERE userIdx = ${req.decoded.idx} AND isRead = 0 ORDER BY createAt`;
    const selectNoticeResult = await db.queryParam_None(selectNoticeQuery);

    if (!selectNoticeResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_NOTIFICATION_SUCCESS, selectNoticeResult));    // 작품 삭제 성공
});

module.exports = router;