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

module.exports = {
    getHeader
}