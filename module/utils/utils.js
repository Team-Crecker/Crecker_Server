const authUtil = {
    successTrue: (status, message, data) => {
        return {
            statusCode: status,
            success: true,
            message: message,
            data: data
        }
    },
    successFalse: (status, message) => {

        return {
            statusCode: status,
            success: false,
            message: message
        }
    }
};

module.exports = authUtil;