const express = require('express');
const router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const moment = require('moment')
const isLoggedin = require('../../../module/utils/authUtils').isLoggedin
const authVideo = require('../../../module/youtube').authVideo
/*
마이 페이지 중에서 광고만 추출해서 라우트
1. 광고 상태별 조회
 -> 개수를 세어주기도 해야하고, 상태별로 내용까지 보내 줘야 함
 -> 예상 라우트 : /userad/:progress
 -> 배정된
 -> GET
2. 광고 상태별 조회에서 조회순/마감순 정렬 -> 이거를 생각해보기
 -> 조회순 마감순 따라서 다르게 정렬
 -> 예상 라우트 : /userad/:progress/:flag
 -> GET
3. 광고 상태별 조회에서 개별 조회
 -> 클라이언트가 인덱스를 넘겨줄 때 사용
 -> 광고와 너무 똑같은데 라우트 개선법 찾아보기
 -> /userad/:progress/:flag/:useradIdx
 -> GET
4. 인증
 -> 업로드 url 입력 후, 요청으로 url을 받으면 유튜브 api에 접근해서 데이터를 가져온 뒤 보내줌
 -> /userad/2(배정)/:useradIdx/auth
 -> POST
*/

router.get("/", isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    const selectUserNewsQuery = `SELECT * FROM UserNews as a JOIN SupportNews as b ON a.newsIdx=b.newsIdx WHERE a.userIdx=${userIdx} AND a.isScrapped = 1 ORDER BY b.calendarEnd DESC`
    const selectUserNewsResult = await db.queryParam_None(selectUserNewsQuery)

    let resData = selectUserNewsResult.map(element => {
        return {...element, dday: moment().diff(element.calendarEnd,'days'), createAt: moment(element.createAt).format('YY.MM.DD'), updateAt: moment(element.createAt).format('YY.MM.DD'), calendarStart: moment(element.calendarStart).format('YY.MM.DD'), calendarEnd: moment(element.calendarEnd).format('YY.MM.DD')}
    })

    if (!selectUserNewsResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USERNEWS_SUCCESS, resData));
    
});

// router.get("/:idx", isLoggedin ,async (req, res) => {
//     const userIdx = req.decoded.idx;
//     const selectUseradQuery = `SELECT * FROM UserNews as a JOIN SupportNews as b ON a.newsIdx=b.newsIdx WHERE a.userIdx=${userIdx} AND a.isScrapped = 1 AND a.newsIdx = ${req.params.idx}`
//     const selectUseradResult = await db.queryParam_None(selectUseradQuery)

//     if (!selectUseradResult)
//         res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
//     else
//         res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USERNEWS_SUCCESS, selectUseradResult));    // 작품 삭제 성공 
// });

module.exports = router;