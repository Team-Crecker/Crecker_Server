var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const authUtil = require("../../../module/utils/authUtils");
const cron = require('node-cron')
const moment = require('moment')
const common = require("../../../module/common");

router.get('/', authUtil.isLoggedin, async (req, res) => {
    // 개별 리포트 토탈
    const idx = req.decoded.idx
    
    let resData = []

    const selectPersonalReportQuery = `SELECT a.userAdIdx, b.title, d.likes, d.views1, b.categoryCode FROM UserAd as a
    JOIN Ad as b ON a.adIdx=b.adIdx
    JOIN User as c ON a.userIdx=c.userIdx
    JOIN VideoInfo as d ON a.videoInfoIdx=d.videoInfoIdx
    WHERE a.progress=4 ORDER BY b.uploadFrom DESC;`;

    const selectPersonalReportResult = await db.queryParam_None(selectPersonalReportQuery)
    // console.log(selectPersonalReportResult)
    for (elem of selectPersonalReportResult) {
        const userAdIdx = elem['userAdIdx']
        const title = elem['title']
        const likes = elem['likes']
        const views1 = elem['views1']
        const categoryName = common.changeKRName(elem['categoryCode'])
        resData.push({'userAdIdx': userAdIdx, 'title': title, 'likes': likes, 'views1': views1, 'categoryName': categoryName})
    }

    // resData.push({'userAdIdx': userAdIdx, 'title': title, 'companyName': companyName, 'likes': likes, 'views1': views1, 'categoryName': categoryName})
    if (!selectPersonalReportResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.PERSONAL_REPORT_SUCCESS, resData));
    }
})

router.get('/info', authUtil.isLoggedin, async (req, res) => {
    // 토탈
    const idx = req.decoded.idx

    let resData = {
        'totalViews': 0,
        'totalLikes': 0,
        'totalCosts': 0,
        'er': 0,
        'totalViews1': 0,
        'totalViews2': 0,
        'totalViews3': 0,
        'totalViews4': 0,
        'totalViews5': 0,
        'top': []
    }

    const selectTotalQuery = `SELECT a.totalViews1, a.totalViews2, a.totalViews3, a.totalViews4, a.totalViews5, a.totalLikes, a.totalCosts, a.er FROM User as a
    WHERE a.userIdx=?;`

    const selectTotalResult = await db.queryParam_Arr(selectTotalQuery, [idx]);
    resData['totalViews'] = selectTotalResult[0]['totalViews1'];
    resData['totalLikes'] = selectTotalResult[0]['totalLikes'];
    resData['totalCosts'] = selectTotalResult[0]['totalCosts'];
    resData['er'] = selectTotalResult[0]['er'];
    resData['totalViews1'] = selectTotalResult[0]['totalViews1'];
    resData['totalViews2'] = selectTotalResult[0]['totalViews2'];
    resData['totalViews3'] = selectTotalResult[0]['totalViews3'];
    resData['totalViews4'] = selectTotalResult[0]['totalViews4'];
    resData['totalViews5'] = selectTotalResult[0]['totalViews5'];

    const selectTop3Query = `SELECT SUM(d.views1) as sum, COUNT(*) as counts FROM UserAd as a
    JOIN Ad as b ON a.adIdx=b.adIdx
    JOIN User as c ON a.userIdx=c.userIdx
    JOIN VideoInfo as d ON a.videoInfoIdx=d.videoInfoIdx
    WHERE a.progress=4 AND b.categoryCode=?;`

    const categoryCodeList = ['0101', '0102', '0103', '0104', '0105', '0106'];
    let selectTop3Result
    for (const [i, categoryCode] of categoryCodeList.entries()) {
        if (i === 3) {
            break;
        }
        selectTop3Result = await db.queryParam_Arr(selectTop3Query, [categoryCode]);
        const sum = selectTop3Result[0]['sum']
        const counts = selectTop3Result[0]['counts']
        const views = (sum / counts).toFixed(1)
        resData['top'].push({'name': common.changeENGName(categoryCode), 'views': views === 'NaN' ? 0 : parseInt(views) })
    }
    resData['top'].sort(function(a, b) {
        return b['views'] - a['views'];
    })
    // console.log(resData)
    // console.log(selectTop3Result);

    if (!selectTop3Result || !selectTop3Result) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.TOTAL_REPORT_SUCCESS, resData));
    }
})


router.get('/:userAdIdx', authUtil.isLoggedin, async (req, res) => {
    // 개별 리포트 상세
    const idx = req.decoded.idx
    const userAdIdx = req.params.userAdIdx
    // console.log(idx);

    let resData = {
        'title': 0,
        'uploadTo': 0,
        'totalCosts': 0,
        'updateAt': 0,
        'cash': 0,
        'likes': 0,
        'views1': 0,
        'views2': 0,
        'views3': 0,
        'views4': 0,
        'views5': 0,
    }

    const selectPersonalReportQuery = `SELECT a.userAdIdx, b.title, b.uploadTo, b.updateAt, b.cash, d.likes, d.views1, d.views2, d.views3, d.views4, d.views5 FROM UserAd as a
    JOIN Ad as b ON a.adIdx=b.adIdx
    JOIN User as c ON a.userIdx=c.userIdx
    JOIN VideoInfo as d ON a.videoInfoIdx=d.videoInfoIdx
    WHERE a.userAdIdx=? ORDER BY b.uploadFrom DESC;`;

    const selectPersonalReportResult = await db.queryParam_Arr(selectPersonalReportQuery, [userAdIdx])
    
    resData['totalViews1'] = selectTotalResult[0]['title'];
    resData['totalViews2'] = selectTotalResult[0]['uploadTo'];
    resData['totalViews3'] = selectTotalResult[0]['totalCosts'];
    resData['totalViews4'] = selectTotalResult[0]['updateAt'];
    resData['totalViews5'] = selectTotalResult[0]['cash'];
    resData['totalViews5'] = parseInt(selectTotalResult[0]['views1']);
    resData['totalViews5'] = parseInt(selectTotalResult[0]['views2']);
    resData['totalViews5'] = parseInt(selectTotalResult[0]['views3']);
    resData['totalViews5'] = parseInt(selectTotalResult[0]['views4']);
    resData['totalViews5'] = parseInt(selectTotalResult[0]['views5']);

    if (!selectPersonalReportResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.PERSONAL_REPORT_SUCCESS, resData));
    }
})

module.exports = router;