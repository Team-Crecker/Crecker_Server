const express = require('express');
const router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const moment = require('moment')
const isLoggedin = require('../../../module/utils/authUtils').isLoggedin
const authVideo = require('../../../module/youtube').authVideo;
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


router.get("/:progress", isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    let selectUseradQuery;
    if (req.params.progress == 1)
        selectUseradQuery = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=1 AND a.userIdx=${userIdx} ORDER BY b.uploadFrom DESC`;
    else if (req.params.progress == 2) 
        selectUseradQuery = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash, b.uploadTo FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=2 AND a.userIdx=${userIdx} ORDER BY b.uploadFrom DESC`;
    else if (req.params.progress == 3)
        selectUseradQuery = 'SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=3 ORDER BY b.uploadFrom DESC';
    else if (req.params.progress == 4)
        selectUseradQuery = 'SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=4 ORDER BY b.uploadFrom DESC';
    const selectUseradResult = await db.queryParam_None(selectUseradQuery)
    const length = {'length' : selectUseradResult.length}
    
    
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

router.post("/confirm/", async (req, res) => {
    const idx = req.body.idx;
    const adIdx = req.body.adIdx
    // const confirmQuery = `UPDATE INTO UserAd as a (progress) VALUES (?) JOIN a. WHERE `
    // INSERT NOTIFICATION 

});

router.post("/notConfirm/", async (req, res) => {
    const idx = req.body.idx;
    const adIdx = req.body.adIdx
    
    // INSERT NOTIFICATION 
    // 광고가 배정되지 않았습니다.
});

router.post('/auth' , isLoggedin, authVideo, async (req, res) => {
    const {thumbnails, publishedAt, viewCount, likeCount} = req.youtubeData;
    const {adIdx ,url, review} = req.body;

    const insertVideoInfoQuery = `INSERT INTO VideoInfo (thumbnail, url, uploadDate, review, likes, views1) VALUES (?,?,?,?,?,?)`;
    const insertVideoInfoResult = await db.queryParam_Arr(insertVideoInfoQuery, [thumbnails, url, publishedAt, review, likeCount, viewCount]);

    const selectVideoInfoQuery = `SELECT videoInfoIdx FROM VideoInfo WHERE url = '${url}'`;
    const updateUserAdQuery = `UPDATE UserAd SET progress = 3, updateAt = ?, videoInfoIdx = ? WHERE userIdx=? AND adIdx=?`;
    
    const selectVideoInfoResult = await db.queryParam_None(selectVideoInfoQuery);

    console.log(selectVideoInfoResult);
    if (!selectVideoInfoResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "셀렉트"));    // 작품 삭제 성공

    const updateUserAdResult = await db.queryParam_Arr(updateUserAdQuery,[moment().format('YYYY-MM-DD HH:mm:ss'), selectVideoInfoResult[0].videoInfoIdx, req.decoded.idx, adIdx])

    if(!insertVideoInfoResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "인서트"));    // 작품 삭제 성공
    else if (!updateUserAdResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "업데이트"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 광고 개별 조회 성공")); 
})

router.get('/ing', async (req, res) => {
    // SELECT UserAd에서 progress=3인것만 리스트로 보여주면 됨
    // UserAd idx, Adidx, Useridx, 
})

router.post('/ing', async (req, res) => {
    // Update UserAd에서 progress=3인것을 4로 바꾸는 로직
    const idx = req.body.idx;
    const adIdx = req.body.adIdx
    // UserAd의 progress=4로 바꿔줌
    // User.cash += Ad.price
    // 리워드가 적립되었습니다. cash를 확인해보세요
});

module.exports = router;