var request = require('request');

var getStructDirectory = function(url, accessToken, callback)
{
    request.get(
        {
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            }
        }, (err, response, body) => {
            if(err){
                callback(err, null)
            }
            callback(null, JSON.parse(body).response);
        }
    )
}

module.exports = getStructDirectory;