var request = require('request');

const {
    domen,
    const_api,
    folder,
    file,
    openedit,
    insert,
    no_createFile,
    copy,
    move,
    text,
    const_files,
    const_auth
} = require('./config.ts')

var requestAuth = function(username, password, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${const_auth}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            form: {
                "userName": username,
                "password": password
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            if(JSON.parse(response.body).statusCode !== 201){
                callback(new Error('authentication failed'), null)
            }
            else{
                callback(null, JSON.parse(response.body).response.token);
            }
        }
    )
}

var getStructDirectory = function(folderId, token, callback)
{
    request.get(
        {
            url: `${domen}${const_api}${const_files}${folderId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        }, (err, response, body) => {
            if(err){
                callback(err, null)
            }
            callback(null, JSON.parse(body).response);
        }
    )
}

var createDirectory = function(parentId, title, token, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${const_files}${folder}${parentId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
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

var deleteDirectory = function(folderId, token, callback)
{
    request.delete(
        {
            method: 'DELETE',
            url: `${domen}${const_api}${const_files}${folder}${folderId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            },
            form: {
                "deleteAfter": true,
                "immediately": true
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, JSON.parse(response.body).response);
        }
    )
}

var getFileDownloadUrl = function(parentId, fileId, token, callback)
{
    request.get(
        {
            url: `${domen}${const_api}${const_files}${file}${fileId}${openedit}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        }, (err, response, body) => {
            if(err){
                callback(err, null);
            }
            else if(JSON.parse(body).statusCode !== 200){
                callback(new Error(`${JSON.parse(body).error.message}`), null);
            }
            else{
                let streamFile = request.get(JSON.parse(body).response.document.url);
                streamFile.end();
                callback(null, streamFile);
            }
        }
    )
}

var createFile = function(folderId, title, token, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${const_files}${folderId}/${file}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
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

var createFiletxt = function(folderId, title, token, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${const_files}${folderId}${text}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            },
            form: {
                "title": title,
                "content": ' '
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, JSON.parse(response.body).response);
        }
    )
}

var deleteFile = function(fileId, token, callback)
{
    request.delete(
        {
            method: 'DELETE',
            url: `${domen}${const_api}${const_files}${file}${fileId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            },
            form: {
                "deleteAfter": true,
                "immediately": true
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, JSON.parse(response.body).response);
        }
    )
}

var rewritingFile = function(folderId, title, content, token, callback)
{
    const encode_title = encodeURIComponent(`${title}`);
    request.post(
        {
            method: 'POST',
            url: `${domen}${const_api}${const_files}${folderId}${insert}${encode_title}${no_createFile}`,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Accept': 'application/json',
                'Authorization': token
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

var  copyFileToFolder = function(folderId, files, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${const_files}${copy}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
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

var  copyDirToFolder = function(folderId, folders, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${const_files}${copy}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
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

var  moveDirToFolder = function(folderId, folders, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${const_files}${move}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
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

var  moveFileToFolder = function(folderId, files, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${const_files}${move}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
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

var renameFolder = function(folderId, newName, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${const_files}${folder}${folderId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            },
            form: {
                "title": newName
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            callback(null, response)
        }
    )
}

var renameFile = function(fileId, newName, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${const_api}${const_files}${file}${fileId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            },
            form: {
                "title": newName
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
    moveDirToFolder,
    renameFolder,
    renameFile,
    createFiletxt,
    requestAuth
};