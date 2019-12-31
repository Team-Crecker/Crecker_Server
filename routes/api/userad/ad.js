const express = require('express');
const router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const isLoggedin = require('../../../module/utils/authUtils').isLoggedin
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
router.get("/:progress",async (req, res) => {
    let selectUseradQuery;
    if (req.params.progress == 1)
        selectUseradQuery = 'SELECT b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.adIdx WHERE a.progress=1 ORDER BY b.uploadFrom DESC';
    else if (req.params.progress == 2) 
        selectUseradQuery = 'SELECT b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.adIdx WHERE a.progress=2 ORDER BY b.uploadFrom DESC';
    else if (req.params.progress == 3)
        selectUseradQuery = 'SELECT b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.adIdx WHERE a.progress=3 ORDER BY b.uploadFrom DESC';
    else if (req.params.progress == 4)
        selectUseradQuery = 'SELECT b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.adIdx WHERE a.progress=4 ORDER BY b.uploadFrom DESC';
    const selectUseradResult = await db.queryParam_None(selectUseradQuery)
    
    // selectUseradResult.adlength = selectUseradResult.length;
    console.log(selectUseradResult)
    if (!selectUseradResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 광고 조회 성공", selectUseradResult));
    
});

// router.get("/:progress/:flag", isLoggedin ,async (req, res) => {
//     let selectUseradQuery;
    
//     switch(req.params.flag) {
    
//     case 0 :
//         if (req.params.progress == 1) //
//         selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=1 ORDER BY a.uploadFrom DESC';
//         else if (req.params.progress == 2) //
//         selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=2 ORDER BY a.uploadFrom DESC';
//         else if (req.params.progress == 3) //지원금 활동
//         selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=3 ORDER BY a.uploadFrom DESC';
//         else if (req.params.progress == 4)
//         selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=4 ORDER BY a.uploadFrom DESC';
//     case 1 :
//         if (req.params.progress == 1) //
//                 selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=1 ORDER BY a.createAt DESC';
//             else if (req.params.progress == 2) //
//                 selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=2 ORDER BY a.createAt DESC';
//             else if (req.params.progress == 3) //지원금 활동
//                 selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=3 ORDER BY a.createAt DESC';
//             else if (req.params.progress == 4)
//                 selectUseradQuery = 'SELECT b.ad_idx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.userAdIdx=b.ad_idx WHERE a.progress=4 ORDER BY a.createAt DESC';
//         }
//         const selectUseradResult = await db.queryParam_None(selectUseradQuery)

//     if (!selectUseradResult)
//         res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
//     else
//         res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 광고 정렬별 조회 성공", selectUseradResult));    // 작품 삭제 성공
    
// });

router.get("/:progress/:idx", async (req, res) => {
    const selectUseradQuery = `SELECT * FROM Ad WHERE adIdx = ${req.params.idx}`
    const selectUseradResult = await db.queryParam_None(selectUseradQuery)

    if (!selectUseradResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 광고 개별 조회 성공", selectUseradResult));    // 작품 삭제 성공 
});

router.post('/auth' , async (req, res) => {
    
})

module.exports = router;