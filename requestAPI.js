var request = require('request');
const accessToken = '8AmgZR8BpZmrWqDINk/M7nvjDNuvI2uG07AMwhGg/IUuAr0+dytOxTrTSlnP9yv90WypKrW6joNF1jGStdN3oshPjJ5X5gpyrvqjODL3yIftyv9mIlXEhIybZTl1dklJM5Y0SMlgnEwOjp6wpUIVAQ=='
const {
    domen,
    const_api,
    folder
} = require('./config.ts')

var getStructDirectory = function(folderId, username, password, callback)
{
    request.get(
        {
            url: `${domen}${const_api}${folderId}`,
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

var createDirectory = function(parentId, title, username, password, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${folder}${parentId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            },
            form: {
                "title": title
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            console.log(JSON.parse(response.body))
            callback(null, JSON.parse(response.body).response);
        }
    )
}

var deleteDirectory = function(folderId, username, password, callback)
{
    request.delete(
        {
            method: 'DELETE',
            url: `${domen}${const_api}${folder}${folderId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            },
            form: {
                "deleteAfter": true,
                "immediately": true
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            console.log(JSON.parse(response.body))
            callback(null, JSON.parse(response.body).response);
        }
    )
}

module.exports = {
    getStructDirectory,
    createDirectory,
    deleteDirectory
};