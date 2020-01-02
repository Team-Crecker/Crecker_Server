const moment = require('moment')


const authUtil = {
    curTime : () => {
        return moment().format('YY.MM.DD HH:mm:ss')
    },
};

module.exports = authUtil;