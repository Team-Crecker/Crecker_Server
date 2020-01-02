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
const notifyMessage =require('../../../module/utils/notifyMessage')
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

router.get("/length", isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;

    const selectUseradQuery1 = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=1 AND a.userIdx=${userIdx}`;
    const selectUseradQuery2 = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash, b.uploadTo FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=2 AND a.userIdx=${userIdx}`;
    const selectUseradQuery3 = 'SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=3';
    const selectUseradQuery4 = 'SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=4';

    const selectUseradResult1 = await db.queryParam_None(selectUseradQuery1);
    const selectUseradResult2 = await db.queryParam_None(selectUseradQuery2);
    const selectUseradResult3 = await db.queryParam_None(selectUseradQuery3);
    const selectUseradResult4 = await db.queryParam_None(selectUseradQuery4);

    const length = {'1' : selectUseradResult1.length, '2' : selectUseradResult2.length, '3' : selectUseradResult3.length, '4' : selectUseradResult4.length}
    //get 한번에 4개

    if (!selectUseradResult1 || !selectUseradResult2 || !selectUseradResult3 || !selectUseradResult4 )
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_AD_SUCCESS, length));
    
});

router.get("/:progress", isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    let selectUseradQuery;
    if (req.params.progress == 1)
        selectUseradQuery = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash, b.createAt ,b.uploadTo FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=1 AND a.userIdx=${userIdx} ORDER BY b.uploadFrom DESC`;
    else if (req.params.progress == 2) 
        selectUseradQuery = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash, b.createAt ,b.uploadTo FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=2 AND a.userIdx=${userIdx} ORDER BY b.uploadFrom DESC`;
    else if (req.params.progress == 3)
        selectUseradQuery = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash, b.createAt ,b.uploadTo FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=3 AND a.userIdx=${userIdx} ORDER BY b.uploadFrom DESC`;
    else if (req.params.progress == 4)
        selectUseradQuery = `SELECT a.userAdIdx, b.adIdx, b.thumbnail, b.title, b.cash, b.createAt ,b.uploadTo FROM UserAd as a JOIN Ad as b ON a.adIdx=b.adIdx WHERE a.progress=4 AND a.userIdx=${userIdx} ORDER BY b.uploadFrom DESC`;
    const selectUseradResult = await db.queryParam_None(selectUseradQuery)

    console.log(selectUseradResult)
    if (req.params.progress == 2) {
        for (var element of selectUseradResult) { //모멘트값 일자까지
            const isWarn = alerm(element);
            if (isWarn)
                element.isWarn = 1;
            else
                element.isWarn = 0;
        }
    } 

    if (!selectUseradResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_AD_SUCCESS, selectUseradResult));
    
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
//         res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
//     else
//         res.status(200).send(defaultRes.successTrue(statusCode.OK, "유저 광고 정렬별 조회 성공", selectUseradResult));    // 작품 삭제 성공
    
// });
const convert = element => {
    return {...element,
    applyFrom: moment(element.applyFrom).format('YY.MM.DD'),
    applyTo: moment(element.applyTo).format('YY.MM.DD'),
    choice: moment(element.choice).format('YY.MM.DD'),
    completeDate: moment(element.completeDate).format('YY.MM.DD'),
    uploadFrom: moment(element.uploadFrom).format('YY.MM.DD'),
    uploadTo: moment(element.uploadTo).format('YY.MM.DD'),
    }
};

router.get("/:progress/:idx", isLoggedin,async (req, res) => {
    const {progress} = req.params;
    const userIdx = req.decoded.idx;
    const selectUseradQuery = `SELECT * FROM UserAd as a JOIN Ad as b ON a.adIdx = b.adIdx WHERE a.progress=${progress} AND a.userAdIdx = ${req.params.idx} AND a.userIdx=${userIdx}` //개별 인덱스 똑바로 가져오게 수정 요망
    const selectUseradResult = await db.queryParam_None(selectUseradQuery)

    let resData = selectUseradResult.map(convert);

    if (!selectUseradResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_AD_ONE_SUCCESS, resData));    // 작품 삭제 성공 
});

router.post("/confirm" ,async (req, res) => {
    const {userIdx, adIdx} = req.body;
    const updateConfirmQuery = `UPDATE UserAd SET progress = 2, updateAt = '${moment().format('YYYY-MM-DD HH:mm:ss')}' WHERE userIdx = ${userIdx} AND adIdx = ${adIdx}`;
    const updateConfirmResult = await db.queryParam_None(updateConfirmQuery);
    console.log(updateConfirmResult)
    const selectAdQuery = `SELECT categoryCode, thumbnail FROM Ad WHERE adIdx=${adIdx}`;
    const selectAdResult = await db.queryParam_None(selectAdQuery);
    console.log(selectAdResult)
    const insertNotifyQuery = `INSERT INTO Notification (categoryCode, notiContent, thumbnail, userIdx ,createAt) VALUES (?,?,?,?,?)`;
    
    const insertNotifyResult = await db.queryParam_Arr(insertNotifyQuery, [`'${selectAdResult[0].categoryCode}'`, notifyMessage.CONFIRMED, selectAdResult[0].thumbnail, userIdx ,moment().format('YYYY-MM-DD HH:mm:ss')]);

    
    if (!updateConfirmResult || !insertNotifyResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.UPDATE_USERAD_COMPLETE_SUCCESS)); 
    // INSERT NOTIFICATION 
});

router.post("/notConfirm/", async (req, res) => {
    const idx = req.body.idx;
    const adIdx = req.body.adIdx;


    // INSERT NOTIFICATION 
    // 광고가 배정되지 않았습니다.
});

router.get("/auth/auth/auth", isLoggedin, authVideo, async (req, res) => {
    const resData = {};
    resData.thumbnails = req.youtubeData.thumbnails;
    resData.publishedAt = moment(req.youtubeData.publishedAt).format('YY/ MM/ DD');
    if (!resData)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_AD_ONE_SUCCESS, resData));    // 작품 삭제 성공 
});

//썸네일 전달 해주는 GET 파기, 날짜 형식 : 2019/ 12/ 25
router.post('/auth' , isLoggedin, authVideo, async (req, res) => {
    const {thumbnails, publishedAt, viewCount, likeCount} = req.youtubeData;
    const {adIdx ,url, review} = req.body;

    const insertVideoInfoQuery = `INSERT INTO VideoInfo (thumbnail, url, uploadDate, review, likes, views1) VALUES (?,?,?,?,?,?)`;
    const insertVideoInfoResult = await db.queryParam_Arr(insertVideoInfoQuery, [thumbnails, url, publishedAt, review, likeCount, viewCount]);

    const selectVideoInfoQuery = `SELECT videoInfoIdx FROM VideoInfo WHERE url = '${url}'`;
    const updateUserAdQuery = `UPDATE UserAd SET progress = 3, updateAt = ?, videoInfoIdx = ? WHERE userIdx=? AND adIdx=?`;
    
    const selectVideoInfoResult = await db.queryParam_None(selectVideoInfoQuery);

    // const insertNotifyQuery = `INSERT INTO Notification (categoryCode, notiContent, thumbnail, createAt) VALUES (?,?,?,?)`;
    // const selectAdQuery = `SELECT thumbnail, categoryCode FROM Ad WHERE adIdx=${adIdx}`;
    // const selectUseradResult = await db.queryParam_None(selectAdQuery);
    // console.log(selectUseradResult)
    // let dealWithData = {};
    // dealWithData = selectUseradResult[0];
    // const insertNotifyResult = await db.queryParam_Arr(insertNotifyQuery, [dealWithData.categoryCode, '비디오가 인증 완료 되었습니다', dealWithData.thumbnail, moment().format('YYYY-MM-DD HH:mm:ss')]);
    
    // console.log(selectVideoInfoResult);
    if (!selectVideoInfoResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공

    const updateUserAdResult = await db.queryParam_Arr(updateUserAdQuery,[moment().format('YYYY-MM-DD HH:mm:ss'), selectVideoInfoResult[0].videoInfoIdx, req.decoded.idx, adIdx])

    if(!insertVideoInfoResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else if (!updateUserAdResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_VIDEOINFO_SUCCESS)); 
})

router.get('/ing/ing/ing', async (req, res) => {
    const {userIdx, adIdx} = req.body;
    console.log(req.params)
    const selectConfirmQuery = `SELECT * FROM UserAd WHERE userIdx = ${userIdx} AND adIdx = ${adIdx} AND progress = '3'`;
    const selectConfirmResult = await db.queryParam_None(selectConfirmQuery);

    if (!selectConfirmResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_USER_AD_SUCCESS, selectConfirmResult)); 
    // SELECT UserAd에서 progress=3인것만 리스트로 보여주면 됨
    // UserAd idx, Adidx, Useridx, 
})

router.put('/ing/', async (req, res) => {
    // Update UserAd에서 progress=3인것을 4로 바꾸는 로직
    const {userIdx, adIdx} = req.body;
    const updateConfirmQuery = `UPDATE UserAd SET progress = 4, updateAt = ${moment().format('YYYY-MM-DD')} WHERE userIdx = ${userIdx} AND adIdx = ${adIdx} AND progress = 3`;
    const updateConfirmResult = await db.queryParam_None(updateConfirmQuery);

    const selectCashQuery = `SELECT categoryCode,cash,thumbnail FROM Ad WHERE adIdx = ${adIdx}`;
    const selectCashResult = await db.queryParam_None(selectCashQuery);
    console.log(selectCashResult)
    const updateUserQuery = `UPDATE User SET cash = cash + '${selectCashResult[0].cash}' WHERE userIdx=${userIdx}`
    const updateUserResult = await db.queryParam_None(updateUserQuery);

    const insertNotifyQuery = `INSERT INTO Notification (categoryCode, notiContent, thumbnail, userIdx ,createAt) VALUES (?,?,?,?,?)`;
    
    const insertNotifyResult = await db.queryParam_Arr(insertNotifyQuery, [selectCashResult[0].categoryCode, notifyMessage.REWARD, selectCashResult[0].thumbnail, userIdx ,moment().format('YYYY-MM-DD HH:mm:ss')]);
    if (!updateConfirmResult || !selectCashResult || !updateUserResult || !insertNotifyResult)
        res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.UPDATE_USERAD_COMPLETE_SUCCESS)); 
    
    
    // UserAd의 progress=4로 바꿔줌
    // User.cash += Ad.price
    // 리워드가 적립되었습니다. cash를 확인해보세요
});

module.exports = router;