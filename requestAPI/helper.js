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

var exceptionResponse = function(body, callback){
    try{
        const statusCode = JSON.parse(body).statusCode;
        if(statusCode !== 201 && statusCode !== 200){
            callback(new Error(`${JSON.parse(body).error.message}`), null)
        }
        else callback()
    }
    catch{
        callback(new Error('Error JSONparse response from api'), null)
    }
}

module.exports = {
    getHeader,
    exceptionResponse
}