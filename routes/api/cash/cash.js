var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const authUtil = require("../../../module/utils/authUtils");
const common = require("../../../module/common");
const moment = require('moment');

router.get('/', authUtil.isLoggedin, async (req, res) => {
    const idx  = req.decoded.idx; 
    console.log(req.body)
    const resData = {
        'cash': 0,
        'cashAllowed': 0,
        'history': []
    }
    const cashQuery = `SELECT * FROM User WHERE userIdx=?`;
    const cashResult = await db.queryParam_Arr(cashQuery, [idx]);
    const cash = cashResult[0]['cash']
    const cashAllowed = cashResult[0]['cashAllowed']
    resData['cash'] = cash
    resData['cashAllowed'] = cashAllowed

    const historyQuery = `SELECT * FROM History where userIdx=? ORDER BY date DESC`
    const historyResult = await db.queryParam_Arr(historyQuery, [idx]);

    for (let elem of historyResult) {
        const title = elem['title']
        const isIn = elem['isIn']
        const price = elem['price']
        const date = elem['date']
        const data = {'title': title, 'isIn': isIn, 'price': price, 'date': date}
        resData['history'].push(data)
    }
    // console.log(historyResult)
    if (!historyResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.CASH_HISOTRY_SCUEESS, resData))
    }
})

router.post('/withdraw', authUtil.isLoggedin, async (req, res) => {
    // 인출하기 버튼 눌렀을 때
    const idx = req.decoded.idx
    const withdrawQuery = `SELECT * FROM User where userIdx=?`
    const withdrawResult = await db.queryParam_Arr(withdrawQuery, [idx]);
    // console.log(withdrawResult)
    let cash = withdrawResult[0]['cash']
    let cashAllowed = withdrawResult[0]['cashAllowed']

    cash = cash - cashAllowed
    cashAllowed = 0

    if (!withdrawResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));
    }

    const updateCashQuery = 'UPDATE User SET cash = ?, cashAllowed = ? WHERE userIdx=?'
    const updateCashResult = await db.queryParam_Arr(updateCashQuery, [cash, cashAllowed, idx])

    const insertHistoryQuery = `INSERT INTO History (title, isIn, price, date, userIdx) VALUES (?, ?, ?, ?, ?)`
    const curTime = common.curTime()
    const insertHistoryResult = await db.queryParam_Arr(insertHistoryQuery, ['계좌출금', 0 , cashAllowed, curTime, idx])

    if (!updateCashResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));
    } else{
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.CASH_WITHDRAW_SCUEESS))
    }
})

module.exports = router;
