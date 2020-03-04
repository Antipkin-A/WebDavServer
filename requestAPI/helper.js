const logger = require('../logger.js');

var getHeader = function(contentType, token){
    const ContentType = contentType;
    const Accept = 'application/json';
    const Authorization = token ? token : null;
    return({
        ContentType,
        Accept,
        Authorization
    })
}

var exceptionResponse = function(err, body, callback){
    try{
        if(err){
            logger.log('warn', `${JSON.parse(body).error.message}`)
            callback(err)
        }
        const statusCode = JSON.parse(body).statusCode;
        if(statusCode !== 201 && statusCode !== 200){
            logger.log('warn', `${JSON.parse(body).error.message}`)
            callback(new Error(`${JSON.parse(body).error.message}`), null)
        }
        else callback()
    }
    catch(e){
        logger.log('error', `Error JSONparse response from api ${e}`)
        logger.log('error', `${e}`)
        callback(new Error('Error JSONparse response from api'), null)
    }
}

module.exports = {
    getHeader,
    exceptionResponse
}