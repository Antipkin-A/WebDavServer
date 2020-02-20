var request = require('request');
const accessToken = '8AmgZR8BpZmrWqDINk/M7nvjDNuvI2uG07AMwhGg/IUuAr0+dytOxTrTSlnP9yv9Jw9Mt+2lZRHqGNYf0TOr2pZF1QPolkgA4+yU82+tRJxtSml9d0qxY8igQA1fDKbr6cDnOmoeWQVcDzT48bkCng=='
const {
    domen,
    const_api,
    folder,
    file,
    openedit,
    insert,
    no_createFile,
    copy,
    move
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

var getFileDownloadUrl = function(parentId, fileId, ctx, callback)
{
    request.get(
        {
            url: `${domen}${const_api}${file}${fileId}${openedit}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            }
        }, (err, response, body) => {
            if(err){
                callback(err, null)
            }

            let streamFile = request.get(JSON.parse(body).response.document.url);
            streamFile.end();
            callback(null, streamFile)
        }
    )
}

var createFile = function(folderId, title, ctx, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${folderId}/${file}`,
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
            callback(null, JSON.parse(response.body).response);
        }
    )
}

var deleteFile = function(fileId, username, password, callback)
{
    request.delete(
        {
            method: 'DELETE',
            url: `${domen}${const_api}${file}${fileId}`,
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

var rewritingFile = function(folderId, title, content, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${folderId}${insert}${title}${no_createFile}`,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Accept': 'application/json',
                'Authorization': accessToken
            },
            body: content
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, response)
        }
    )
}

var  copyFileToFolder = function(folderId, files, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${copy}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            },
            form: {
                "destFolderId": folderId,
                "fileIds": files,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, response)
        }
    )
}

var  copyDirToFolder = function(folderId, folders, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${copy}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            },
            form: {
                "destFolderId": folderId,
                "folderIds": folders,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, response)
        }
    )
}

var  moveDirToFolder = function(folderId, folders, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${move}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            },
            form: {
                "destFolderId": folderId,
                "folderIds": folders,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, response)
        }
    )
}

var  moveFileToFolder = function(folderId, files, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${move}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': accessToken
            },
            form: {
                "destFolderId": folderId,
                "fileIds": files,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, response)
        }
    )
}

module.exports = {
    getStructDirectory,
    createDirectory,
    deleteDirectory,
    getFileDownloadUrl,
    createFile,
    deleteFile,
    rewritingFile,
    copyFileToFolder,
    copyDirToFolder,
    moveFileToFolder,
    moveDirToFolder
};