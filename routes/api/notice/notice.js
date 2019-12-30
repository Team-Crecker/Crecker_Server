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


router.get("/", isLoggedin , async function(req, res, next) {
    //다 보여주기

    const selectNoticeQuery = `SELECT * FROM Notification WHERE userIdx = ${req.decoded.idx}`;
    const selectNoticeResult = await db.queryParam_None(selectNoticeQuery);

    if (!selectNoticeResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 알림 조회 성공", selectNoticeResult));    // 작품 삭제 성공
});

// const insertTransaction = await db.Transaction(async (connection) => {
//     const updateClickResult = await connection.query(updateClickQuery, [selectSimpleResult[0].bonus, req.decoded.idx]);
//     const insertBannerResult = await connection.query(insertBannerQuery, [req.body.banner_idx, req.decoded.idx]);

// });
// console.log("성공");
// const insertNotificationResult = await db.queryParam_Arr(insertNotificationQuery,
//     [req.decoded.idx, '2', 3, moment().format('YYYY-MM-DD HH:mm:ss')]);
// const UpdateNotificationResult = await db.queryParam_Arr(UpdateNotificationQuery, [1, req.decoded.idx]);

// if (!insertTransaction) {
//     res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // DB 에러
// } else {    // 성공할 경우
//     res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.CLICK_POINT_BANNER));     // 배너 클릭 포인트 획득
// }

module.exports = router;