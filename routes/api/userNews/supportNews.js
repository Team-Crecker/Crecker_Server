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
const alerm = element => {
    moment.locale('ko');
    const nowDate = moment();
    const warn = moment.duration(moment(element.uploadTo).diff(nowDate)).asDays();
    if(warn <= 1)    
        return true;
    else    
        return false;
}

router.get("/", isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    const selectUseradQuery = `SELECT * FROM UserNews as a JOIN SupportNews as b ON a.newsIdx=b.newsIdx WHERE a.userIdx=${userIdx} AND a.isScrapped = 1 ORDER BY b.calendarEnd DESC`
    const selectUseradResult = await db.queryParam_None(selectUseradQuery)
    const length = {length :selectUseradResult.length}
    
    console.log(selectUseradResult)
    if (req.params.progress == 2) {
        for (var element of selectUseradResult) {
            const isWarn = alerm(element);
            if (isWarn)
                element.isWarn = 1;
            else
                element.isWarn = 0;
        }
    }
    selectUseradResult[selectUseradResult.length] = length;

    if (!selectUseradResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 광고 조회 성공", selectUseradResult));
    
});

router.get("/:idx", isLoggedin ,async (req, res) => {
    const selectUseradQuery = `SELECT * FROM SupportNews WHERE newsIdx = ${req.params.idx}`
    const selectUseradResult = await db.queryParam_None(selectUseradQuery)

    if (!selectUseradResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 광고 개별 조회 성공", selectUseradResult));    // 작품 삭제 성공 
});

module.exports = router;