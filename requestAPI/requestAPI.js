var request = require('request');
const {getHeader} = require('./helper.js')
const {
    domen,
    api,
    apiFiles,
    apiAuth,
    method
} = require('../config.js')

var requestAuth = function(username, password, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${api}${apiAuth}`,
            headers: getHeader('application/json'),
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
            url: `${domen}${api}${apiFiles}${folderId}`,
            headers: getHeader('application/json', token),
        }, (err, response, body) => {
            if(err){
                callback(err, null)
            }
            if(JSON.parse(body).statusCode !== 200){
                callback(new Error(`${JSON.parse(body).error.message}`), null)
            }
            else{
                callback(null, JSON.parse(body).response);
            }
        }
    )
}

var createDirectory = function(parentId, title, token, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${api}${apiFiles}${method.folder}${parentId}`,
            headers: getHeader('application/json', token),
            form: {
                "title": title
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            else if(JSON.parse(response.body).statusCode !== 201){
                callback(new Error(`${JSON.parse(response.body).error.message}`), null);
            }
            else{
                callback(null, JSON.parse(response.body).response);
            }
        }
    )
}

var deleteDirectory = function(folderId, token, callback)
{
    request.delete(
        {
            method: 'DELETE',
            url: `${domen}${api}${apiFiles}${method.folder}${folderId}`,
            headers: getHeader('application/json', token),
            form: {
                "deleteAfter": true,
                "immediately": true
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(body).error.message}`));
            }
            else{
                callback();
            }
        }
    )
}

var getFileDownloadUrl = function(parentId, fileId, token, callback)
{
    request.get(
        {
            url: `${domen}${api}${apiFiles}${method.file}${fileId}${method.openedit}`,
            headers: getHeader('application/json', token),
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
            url: `${domen}${api}${apiFiles}${folderId}/${method.file}`,
            headers: getHeader('application/json', token),
            form: {
                "title": title
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            else if(JSON.parse(response.body).statusCode !== 201){
                callback(new Error(`${JSON.parse(response.body).error.message}`), null);
            }
            else{
                callback(null, JSON.parse(response.body).response);
            }
        }
    )
}

var createFiletxt = function(folderId, title, token, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${api}${apiFiles}${folderId}${method.text}`,
            headers: getHeader('application/json', token),
            form: {
                "title": title,
                "content": ' '
            }
        }, (err, response) => {
            if(err){
                callback(err, null)
            }
            else if(JSON.parse(response.body).statusCode !== 201){
                callback(new Error(`${JSON.parse(response.body).error.message}`), null);
            }
            else{
                callback(null, JSON.parse(response.body).response);
            }
        }
    )
}

var deleteFile = function(fileId, token, callback)
{
    request.delete(
        {
            method: 'DELETE',
            url: `${domen}${api}${apiFiles}${method.file}${fileId}`,
            headers: getHeader('application/json', token),
            form: {
                "deleteAfter": true,
                "immediately": true
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(body).error.message}`));
            }
            else{
                callback();
            }
        }
    )
}

var rewritingFile = function(folderId, title, content, token, callback)
{
    const encode_title = encodeURIComponent(`${title}`);
    request.post(
        {
            method: 'POST',
            url: `${domen}${api}${apiFiles}${folderId}${method.insert}${encode_title}${method.no_createFile}`,
            headers: getHeader('application/json', token),
            body: content
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 201){
                callback(new Error(`${JSON.parse(response.body).error.message}`));
            }
            else{
                callback()
            }
        }
    )
}

var  copyFileToFolder = function(folderId, files, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${api}${apiFiles}${method.copy}`,
            headers: getHeader('application/json', token),
            form: {
                "destFolderId": folderId,
                "fileIds": files,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(response.body).error.message}`));
            }
            else{
                callback()
            }
        }
    )
}

var  copyDirToFolder = function(folderId, folders, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${api}${apiFiles}${method.copy}`,
            headers: getHeader('application/json', token),
            form: {
                "destFolderId": folderId,
                "folderIds": folders,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(response.body).error.message}`));
            }
            else{
                callback()
            }
        }
    )
}

var  moveDirToFolder = function(folderId, folders, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${api}${apiFiles}${method.move}`,
            headers: getHeader('application/json', token),
            form: {
                "destFolderId": folderId,
                "folderIds": folders,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(response.body).error.message}`));
            }
            else{
                callback()
            }
        }
    )
}

var  moveFileToFolder = function(folderId, files, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${api}${apiFiles}${method.move}`,
            headers: getHeader('application/json', token),
            form: {
                "destFolderId": folderId,
                "fileIds": files,
                "conflictResolveType": "Skip",
                "deleteAfter": true
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(response.body).error.message}`));
            }
            else{
                callback()
            }
        }
    )
}

var renameFolder = function(folderId, newName, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${api}${apiFiles}${method.folder}${folderId}`,
            headers: getHeader('application/json', token),
            form: {
                "title": newName
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(response.body).error.message}`));
            }
            else{
                callback()
            }
        }
    )
}

var renameFile = function(fileId, newName, token, callback)
{
    request.put(
        {
            method: 'PUT',
            url: `${domen}${api}${apiFiles}${method.file}${fileId}`,
            headers: getHeader('application/json', token),
            form: {
                "title": newName
            }
        }, (err, response) => {
            if(err){
                callback(err)
            }
            else if(JSON.parse(response.body).statusCode !== 200){
                callback(new Error(`${JSON.parse(response.body).error.message}`));
            }
            else{
                callback()
            }
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