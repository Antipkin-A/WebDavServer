const webdav = require('webdav-server').v2;
const {
    getStructDirectory,
    createDirectory,
    deleteDirectory,
    getFileDownloadUrl,
    createFile,
    createFiletxt,
    deleteFile,
    rewritingFile,
    copyDirToFolder,
    copyFileToFolder,
    moveDirToFolder,
    moveFileToFolder,
    renameFolder,
    renameFile
} = require('../requestAPI/requestAPI.js');
const {method} = require('../config.js');
const streamWrite = require('../Writable.js');

class CustomVirtualResources
{
    constructor(){
        this.struct = {};
    }

    addStructDir(path, user, structDir){
        if(!this.struct){
            this.struct = {};
        }
        if(!this.struct[user]){
            this.struct[user] = {};
        }
        this.struct[user][path] = {};
        this.struct[user][path] = structDir;
        this.struct[user].LiveTime = new Date;
    }

    parsePath(path){
        let pathArray = path.split('/');
        let targetElement = pathArray.pop();
        if(pathArray.length <= 1){
            pathArray[0] = '/'
        }
        let parentPath = pathArray.join('/');
        return{
            element: targetElement,
            parentFolder: parentPath
        }
    }

    parsePathTo(pathTo){
        let pathArray = pathTo.split('/')
        if(pathArray[pathArray.length - 1] == '' && pathTo !== '/'){
            pathArray.pop();
            var newPath = pathArray.join('/')
        }
        else{
            var newPath = pathTo;
        }
        return newPath
    }

    parseDate(dateString){
        let dateArray = dateString.split('.');
        dateArray = dateArray[0].split('T')
        let date = dateArray[0].split('-');
        let time = dateArray[1].split(':');
        return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2])
    }

    checkRename(elementFrom, elementTo, parentFolderFrom, parentFolderTo, user){

        let elementFromIsExist = false;
        let elementToIsExist = false;
        this.struct[user.username][parentFolderFrom].files.forEach((el) => {
            if(elementFrom == el.title){
                elementFromIsExist = true;
            }
        })
        this.struct[user.username][parentFolderFrom].folders.forEach((el) => {
            if(elementFrom == el.title){
                elementFromIsExist = true;
            }
        })
        this.struct[user.username][parentFolderTo].files.forEach((el) => {
            if(elementTo == el.title){
                elementToIsExist = true;
            }
        })
        this.struct[user.username][parentFolderTo].folders.forEach((el) => {
            if(elementTo == el.title){
                elementToIsExist = true;
            }
        })
        const isRename = (elementFromIsExist && !elementToIsExist && (parentFolderFrom == parentFolderTo)) ? true : false;
        return isRename
    }

    getRootFolder(user, callback){
        let structRoot = {
            files: [],
            folders: [],
            current: {}
        }
        getStructDirectory(method.pathRootDirectory, user.token, (err, structDir) => {
            if(err){}
            else{
                structRoot.folders.push(structDir.current)
            }
            getStructDirectory(method.pathCommonDirectory, user.token, (err, structDir) => {
                if(err){
                    if(structRoot.folders.length == 0){
                        callback(webdav.Errors.ResourceNotFound, null)
                    }
                    else{
                        callback(null, structRoot)
                    }
                }
                else{
                    structRoot.folders.push(structDir.current)
                    callback(null, structRoot)
                }
            })
        })
    }

    fastExistCheck(path, ctx, callback){
        if(path == '/'){
            callback(true);
        }
        else{
            const user = ctx.user;
            const {element, parentFolder} = this.parsePath(path);
            let fileisExist = false;
            try{
                this.struct[user.username][parentFolder].files.forEach((el) => {
                    if(element == el.title){
                        fileisExist = true;
                        callback(true);
                    }
                })
                this.struct[user.username][parentFolder].folders.forEach((el) => {
                    if(element == el.title){
                        fileisExist = true;
                        callback(true);
                    }
                })
                if(!fileisExist){
                    if(ctx.request.method !== 'PROPFIND'){
                        callback(false);
                    }
                    else{
                        this.readDir(path, {context: ctx}, (err, st) => {
                            if(err){
                                callback(false);
                            }
                            else{
                                callback(true);
                            }
                        })
                    }
                }
            }
            catch{
                this.readDir(path, {context: ctx}, (err, st) => {
                    if(err){
                        callback(false);
                    }
                    else{
                        callback(true);
                    }
                })
            }
        }
    }

    create(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = this.parsePath(path);
        let parentId = this.struct[user.username][parentFolder].current.id;
            
            if(ctx.type.isDirectory){
                createDirectory(parentId, element, user.token, (err, createdObj) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        this.struct[user.username][parentFolder].folders.push(createdObj)
                        this.readDir(path, ctx, callback)
                        callback()
                    }
                })
            }
            else if(ctx.type.isFile){
                /*createFile(parentId, element, user.token, (err, createdObj) => {
                    if(err){
                        callback(err);
                    }
                    else{
                        this.struct[user.username][parentFolder].files.push(createdObj);
                        callback()
                    }
                })*/
                createFiletxt(parentId, element, user.token, (err, createdObj) => {
                    if(err){
                        callback(err);
                    }
                    else{
                        this.struct[user.username][parentFolder].files.push(createdObj);
                        this.readDir(path, ctx, callback)
                        callback()
                    }
                })
            }
    }

    delete(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = this.parsePath(path);

        this.struct[user.username][parentFolder].folders.forEach((el) => {
            if(element == el.title){
                deleteDirectory(el.id, user.token, (err) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        delete this.struct[user.username][parentFolder].folders.el
                        delete this.struct[user.username][path]
                        callback(null)
                    }
                })
            }
        })

        this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                deleteFile(el.id, user.token, (err) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        delete this.struct[user.username][parentFolder].files.el
                        delete this.struct[user.username][path]
                        callback(null)
                    }
                })
            }
        })
    }

    readDir(path, ctx, callback){

        const user = ctx.context.user;
        
        if(path == '/'){
            this.getRootFolder(user, (err, structDir) => {
                if(err){
                    callback(webdav.Errors.ResourceNotFound, null)
                }
                else{
                    this.addStructDir(path, user.username, structDir)
                    callback(null, this.struct[user.username][path])
                }
            })
        }
        else{
            const {element, parentFolder} = this.parsePath(path);

            try{
                if(!this.struct[user.username][parentFolder]){
                    this.readDirRecursion(parentFolder, ctx, (err) => {
                        if(err){
                            callback(webdav.Errors.ResourceNotFound, null)
                        }
                        else{
                            if(!this.struct[user.username][parentFolder]){
                                this.readDir(path, ctx, callback)
                            }
                            else{
                                this.struct[user.username][parentFolder].folders.forEach((el) => {
                                    if(element == el.title){
                                        let folderId = el.id;
                                        getStructDirectory(folderId, user.token, (err, structDir) => {
                                            if(err){
                                                callback(webdav.Errors.ResourceNotFound, null)
                                            }
                                            this.addStructDir(path, user.username, structDir)
                                            callback(null, this.struct[user.username][path])
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
                else{
                    this.struct[user.username][parentFolder].folders.forEach((el) => {
                        if(element == el.title){
                            let folderId = el.id;
                            getStructDirectory(folderId, user.token, (err, structDir) => {
                                if(err){
                                    callback(webdav.Errors.ResourceNotFound, null)
                                }
                                else{
                                    this.addStructDir(path, user.username, structDir)
                                    callback(null, this.struct[user.username][path])
                                }
                            })
                        }
                    })
                }
            }
            catch{
                this.getRootFolder(user, (err, st) => {
                    if(err){
                        callback(err, null)
                    }
                    else{
                        this.addStructDir('/', user.username, st)
                        this.readDir(path, ctx, callback)
                    }
                })
            }             
        }
    }

    readDirRecursion(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = this.parsePath(path);

        if(!this.struct[user.username][parentFolder]){
            this.readDirRecursion(parentFolder, ctx, callback)
        }
        else{
            this.struct[user.username][parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    let folderId = el.id;
                    getStructDirectory(folderId, user.token, (err, structDir) => {
                        if(err){
                            callback(webdav.Errors.ResourceNotFound)
                        }
                        else{
                            this.addStructDir(path, user.username, structDir)
                            callback()
                        }
                    })
                }
            })
        }
    }

    downloadFile(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = this.parsePath(path);

        this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                getFileDownloadUrl(el.folderId, el.id, user.token, (err, streamFile) => {
                    if(err){
                        callback(err, null);
                    }
                    else{
                        callback(null, streamFile);
                    }
                })
            }
        })
    }

    writeFile(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = this.parsePath(path);
        let folderId = this.struct[user.username][parentFolder].current.id;

        const content = [];
        const stream = new streamWrite(content);

        stream.on('finish', () => {
            this.struct[user.username][parentFolder].files.forEach((el) => {
                if(element == el.title){
                    rewritingFile(folderId, el.title, content, user.token, (err) => {
                        if(err){
                            callback(err, null)
                        }
                    })
                }
            })
        })
        callback(null, stream)
    }

    copy(pathFrom, pathTo, ctx, callback){

        const user = ctx.context.user;
        let {element, parentFolder} = this.parsePath(pathFrom);
        pathTo = this.parsePathTo(pathTo);

        if(this.struct[user.username][pathTo]){
            const folderId = this.struct[user.username][pathTo].current.id;
                this.struct[user.username][parentFolder].folders.forEach((el) => {
                    if(element == el.title){
                        copyDirToFolder(folderId, el.id, user.token, (err) => {
                            if(err){
                                callback(err, null)
                            }
                            else{
                                callback(null, true)
                            }
                        })
                    }
                })
                this.struct[user.username][parentFolder].files.forEach((el) => {
                    if(element == el.title){
                        copyFileToFolder(folderId, el.id, user.token, (err) => {
                            if(err){
                                callback(err, null)
                            }
                            else{
                                callback(null, true)
                            }
                        })
                    }
                })
        }
        else{
            this.readDir(pathTo, ctx, (err, st) => {
                if(err){
                    callback(err, null)
                }
                else{
                    this.copy(pathFrom, pathTo, ctx, callback)
                }
            })
        }
    }

    rename(path, newName, ctx, callback){

        const user = ctx.context.user;
        let {element, parentFolder} = this.parsePath(path);

        this.struct[user.username][parentFolder].folders.forEach((el) => {
            if(element == el.title){
                renameFolder(el.id, newName, user.token, (err) => {
                    if(err){
                        callback(err, null)
                    }
                    else{
                        callback(null, true)
                    }
                })
            }
        })
        this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                renameFile(el.id, newName, user.token, (err) => {
                    if(err){
                        callback(err, null)
                    }
                    else{
                        callback(null, true)
                    }
                })
            }
        })

    }

    move(pathFrom, pathTo, ctx, callback){
        
        pathTo = this.parsePathTo(pathTo);
        let {element: elementFrom, parentFolder: parentFolderFrom} = this.parsePath(pathFrom);
        let {element: elementTo, parentFolder: parentFolderTo} = this.parsePath(pathTo);
        const user = ctx.context.user;

        var isRename = false;
        if(parentFolderFrom == parentFolderTo){
            var isRename = this.checkRename(elementFrom, elementTo, parentFolderFrom, parentFolderTo, user)
        }

        if(isRename){
           this.rename(pathFrom, elementTo, ctx, (err, rename) => {
               if(err){
                   callback(err, rename)
               }
               else{
                callback(null, rename)
               }
           })
        }
        else{
            if(this.struct[user.username][pathTo]){
                const folderId = this.struct[user.username][pathTo].current.id;
                this.struct[user.username][parentFolderFrom].folders.forEach((el) => {
                    if(elementFrom == el.title){
                        moveDirToFolder(folderId, el.id, user.token, (err) => {
                            if(err){
                                callback(err, null)
                            }
                            callback(null, true)
                        })
                    }
                })
                this.struct[user.username][parentFolderFrom].files.forEach((el) => {
                    if(elementFrom == el.title){
                        moveFileToFolder(folderId, el.id, user.token, (err) => {
                            if(err){
                                callback(err, null)
                            }
                            callback(null, true)
                        })
                    }
                })
            }
            else{
                this.readDir(pathTo, ctx, (err, st) => {
                    if(err){
                        callback(err, null)
                    }
                    else{
                        this.move(pathFrom, pathTo, ctx, callback)
                    }
                })
            }
        }
    }

    getType(path, ctx, callback){

        const user = ctx.context.user;

        if(path == '/'){
            callback(webdav.ResourceType.Directory)
        }
        else{
            const {element, parentFolder} = this.parsePath(path);
            
            this.struct[user.username][parentFolder].files.forEach((el) => {
                if(element == el.title){
                    callback(webdav.ResourceType.File)
                }
            })
            this.struct[user.username][parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    callback(webdav.ResourceType.Directory)
                }
            })
        }
    }

    getSize(path, ctx, callback){

        const {element, parentFolder} = this.parsePath(path);
        const user = ctx.context.user;

        this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                let sizeArray = el.contentLength.split(' ');
                let dimension = sizeArray[sizeArray.length -1];
                let size = sizeArray[sizeArray.length -2];
                switch(dimension){
                    case 'bytes':
                        callback(Number(size))
                        break
                    case 'KB':
                        callback(Number(size) * 1000)
                        break
                    case 'MB':
                        callback(Number(size) * 1000000)
                        break
                }
            }
        })
        this.struct[user.username][parentFolder].folders.forEach((el) => {
            if(element == el.title){
                callback()
            }
        })
    }

    getlastModifiedDate(path, ctx, callback){

        if(path != '/'){
            const {element, parentFolder} = this.parsePath(path);
            const user = ctx.context.user;

            this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                callback(this.parseDate(el.updated))
            }
            })
            this.struct[user.username][parentFolder].folders.forEach((el) => {
            if(element == el.title){
                callback(this.parseDate(el.updated))
            }
            })
        }
        else{
            callback(new Date(0, 0, 0, 0, 0, 0))
        }
    }
}

module.exports = CustomVirtualResources;