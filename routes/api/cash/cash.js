var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const authUtil = require("../../../module/utils/authUtils");

router.get('/', authUtil.isLoggedin, async (req, res) => {
    const idx  = req.decoded.idx; 
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
    const withdrawQuery = `SELECT * FROM User where userIdx=? ORDER BY date DESC`
    const withdrawResult = await db.queryParam_Arr(withdrawQuery, [idx]);
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})

module.exports = router;
