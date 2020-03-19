var request = require('request');
const {getHeader, exceptionResponse} = require('./helper.js')
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err);
                }
                else{
                    callback(null, JSON.parse(body).response.token);
                }
            });
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
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err);
                }
                else{
                    callback(null, JSON.parse(body).response);
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback(null, JSON.parse(body).response);
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback();
                }
            });
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
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    let streamFile = request.get(
                        {
                            url: JSON.parse(body).response.document.url,
                            headers: getHeader('application/octet-stream', token),
                        }
                    );
                    streamFile.end();
                    callback(null, streamFile);
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback(null, JSON.parse(body).response);
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback(null, JSON.parse(body).response);
                }
            });
        }
    )
}

var createFilehtml = function(folderId, title, token, callback)
{
    request.post(
        {
            method: 'POST',
            url: `${domen}${api}${apiFiles}${folderId}${method.html}`,
            headers: getHeader('application/json', token),
            form: {
                "title": title,
                "content": ' '
            }
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback(null, JSON.parse(body).response);
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback();
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback()
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback()
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback()
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback()
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback()
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback()
                }
            });
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
        }, (err, response, body) => {
            exceptionResponse(err, body, (err) => {
                if(err){
                    callback(err)
                }
                else{
                    callback()
                }
            });
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
    createFilehtml,
    requestAuth
};