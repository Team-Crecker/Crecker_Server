const moment = require('moment')


const authUtil = {
    curTime : () => {
        return moment().format('YY.MM.DD HH:mm:ss')
    },

    changeKRName = (categoryCode)  => {
        if (categoryCode === '0101') {
            return '프리미엄'
        } else if (categoryCode === '0102') {
            return '뷰티'
        } else if (categoryCode === '0103') {
            return '맛집'
        } else if (categoryCode === '0104') {
            return '여행'
        } else if (categoryCode === '0105') {
            return '기타'
        } else if (categoryCode === '0201') {
            return '법률'
        }
    },

    changeENGName = (categoryCode)  => {
        if (categoryCode === '0101') {
            return 'Primium'
        } else if (categoryCode === '0102') {
            return 'Beauty'
        } else if (categoryCode === '0103') {
            return 'Restaurant'
        } else if (categoryCode === '0104') {
            return 'Travel'
        } else if (categoryCode === '0105') {
            return 'Other'
        } else if (categoryCode === '0201') {
            return 'Law'
        }
    }
};

module.exports = authUtil;