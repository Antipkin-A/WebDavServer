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
    renameFile,
    createFilehtml
} = require('../requestAPI/requestAPI.js');
const {method} = require('../config.js');
const streamWrite = require('../Writable.js');
const SimpleStruct = require('./SimpleStruct.js')
const parse = require('./parseProperty.js')

class CustomVirtualResources
{
    constructor(){
        this.structСache = new SimpleStruct();
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
            const {element, parentFolder} = parse.parsePath(path);
            let fileisExist = false;
            if(this.structСache.getStruct(parentFolder, user.username)){
                this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
                    if(element == el.title){
                        fileisExist = true;
                        callback(true);
                    }
                })
                this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
                    if(element == el.title){
                        fileisExist = true;
                        callback(true);
                    }
                })
                if(!fileisExist){
                    callback(false);
                }
            }
            else{
                this.readDir(parentFolder, {context: ctx}, (err, st) => {
                    if(err){
                        callback(false);
                    }
                    else{
                        fileisExist = false;
                        this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
                            if(element == el.title){
                                fileisExist = true;
                                callback(true);
                            }
                        })
                        this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
                            if(element == el.title){
                                fileisExist = true;
                                callback(true);
                            }
                        })
                        if(!fileisExist){
                            callback(false);
                        }
                    }
                })
            }
        }
    }

    create(path, ctx, callback){

        const user = ctx.context.user;
        let {element, parentFolder} = parse.parsePath(path);
        let parentId = this.structСache.getStruct(parentFolder, user.username).current.id;
            
        if(ctx.type.isDirectory){
            createDirectory(parentId, element, user.token, (err, createdObj) => {
                if(err){
                    callback(err)
                }
                else{
                    this.structСache.setFolderObject(parentFolder, user.username, createdObj)
                    callback()
                }
            })
        }
        else if(ctx.type.isFile){
            element = parse.isExst(element);
            switch(parse.parseFileExst(element)){
                case 'OFFICE_DOCX_PPTX_XLSX':
                    createFile(parentId, element, user.token, (err, createdObj) => {
                        if(err){
                            callback(err);
                        }
                        else{
                            this.structСache.setFileObject(parentFolder, user.username, createdObj)
                            callback()
                        }
                    })
                    break
                case 'html':
                    createFilehtml(parentId, element, user.token, (err, createdObj) => {
                        if(err){
                            callback(err);
                        }
                        else{
                            this.structСache.setFileObject(parentFolder, user.username, createdObj)
                            callback()
                        }
                    })
                    break
                default:
                    createFiletxt(parentId, element, user.token, (err, createdObj) => {
                        if(err){
                            callback(err);
                        }
                        else{
                            this.structСache.setFileObject(parentFolder, user.username, createdObj)
                            callback()
                        }
                    })
                    break
            }
        }
    }

    delete(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = parse.parsePath(path);

        this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
            if(element == el.title){
                deleteDirectory(el.id, user.token, (err) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        this.structСache.dropFolderObject(parentFolder, user.username, el);
                        this.structСache.dropPath(path, user.username);
                        callback(null)
                    }
                })
            }
        })

        this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
            if(element == el.title){
                deleteFile(el.id, user.token, (err) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        this.structСache.dropFileObject(parentFolder, user.username, el);
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
                    this.structСache.setStruct(path, user.username, structDir)
                    callback(null, this.structСache.getStruct(path, user.username))
                }
            })
        }
        else{
            const {element, parentFolder} = parse.parsePath(path);

            try{
                if(!this.structСache.getStruct(parentFolder, user.username)){
                    this.readDirRecursion(parentFolder, ctx, (err) => {
                        if(err){
                            callback(webdav.Errors.ResourceNotFound, null)
                        }
                        else{
                            if(!this.structСache.getStruct(parentFolder, user.username)){
                                this.readDir(path, ctx, callback)
                            }
                            else{
                                this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
                                    if(element == el.title){
                                        let folderId = el.id;
                                        getStructDirectory(folderId, user.token, (err, structDir) => {
                                            if(err){
                                                callback(webdav.Errors.ResourceNotFound, null)
                                            }
                                            this.structСache.setStruct(path, user.username, structDir)
                                            callback(null, this.structСache.getStruct(path, user.username))
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
                else{
                    this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
                        if(element == el.title){
                            let folderId = el.id;
                            if(this.structСache.structIsExpire(path, parentFolder, user.username)){
                                callback(null, this.structСache.getStruct(path, user.username))
                            }
                            else{
                                getStructDirectory(folderId, user.token, (err, structDir) => {
                                    if(err){
                                        callback(webdav.Errors.ResourceNotFound, null)
                                    }
                                    else{
                                        this.structСache.setStruct(path, user.username, structDir)
                                        callback(null, this.structСache.getStruct(path, user.username))
                                    }
                                })
                            }
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
                        this.structСache.setStruct('/', user.username, st)
                        this.readDir(path, ctx, callback)
                    }
                })
            }           
        }
    }

    readDirRecursion(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = parse.parsePath(path);

        if(!this.structСache.getStruct(parentFolder, user.username)){
            this.readDirRecursion(parentFolder, ctx, callback)
        }
        else{
            this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
                if(element == el.title){
                    let folderId = el.id;
                    getStructDirectory(folderId, user.token, (err, structDir) => {
                        if(err){
                            callback(webdav.Errors.ResourceNotFound)
                        }
                        else{
                            this.structСache.setStruct(path, user.username, structDir)
                            callback()
                        }
                    })
                }
            })
        }
    }

    downloadFile(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = parse.parsePath(path);

        this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
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
        const {element, parentFolder} = parse.parsePath(path);
        let folderId = this.structСache.getStruct(parentFolder, user.username).current.id;

        const content = [];
        const stream = new streamWrite(content);

        stream.on('finish', () => {
            this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
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
        let {element, parentFolder} = parse.parsePath(pathFrom);
        pathTo = parse.parsePathTo(pathTo);

        if(this.structСache.getStruct(pathTo, user.username)){
            const folderId = this.structСache.getStruct(pathTo, user.username).current.id;
            this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
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
            this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
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
        let {element, parentFolder} = parse.parsePath(path);

        this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
            if(element == el.title){
                renameFolder(el.id, newName, user.token, (err) => {
                    if(err){
                        callback(err, null)
                    }
                    else{
                        this.structСache.renameFolderObject(element, newName, parentFolder, user.username)
                        callback(null, true)
                    }
                })
            }
        })
        this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
            if(element == el.title){
                renameFile(el.id, newName, user.token, (err) => {
                    if(err){
                        callback(err, null)
                    }
                    else{
                        this.structСache.renameFileObject(element, newName, parentFolder, user.username)
                        callback(null, true)
                    }
                })
            }
        })

    }

    move(pathFrom, pathTo, ctx, callback){
        
        pathTo = parse.parsePathTo(pathTo);
        let {element: elementFrom, parentFolder: parentFolderFrom} = parse.parsePath(pathFrom);
        let {element: elementTo, parentFolder: parentFolderTo} = parse.parsePath(pathTo);
        const user = ctx.context.user;

        var isRename = false;
        if(parentFolderFrom == parentFolderTo){
            var isRename = this.structСache.checkRename(elementFrom, elementTo, parentFolderFrom, parentFolderTo, user)
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
            if(this.structСache.getStruct(pathTo, user.username)){
                const folderId = this.structСache.getStruct(pathTo, user.username).current.id;
                this.structСache.getStruct(parentFolderFrom, user.username).folders.forEach((el) => {
                    if(elementFrom == el.title){
                        moveDirToFolder(folderId, el.id, user.token, (err) => {
                            if(err){
                                callback(err, null)
                            }
                            else{
                                this.structСache.dropFolderObject(parentFolderFrom, user.username, el)
                                callback(null, true)
                            }
                        })
                    }
                })
                this.structСache.getStruct(parentFolderFrom, user.username).files.forEach((el) => {
                    if(elementFrom == el.title){
                        moveFileToFolder(folderId, el.id, user.token, (err) => {
                            if(err){
                                callback(err, null)
                            }
                            else{
                                this.structСache.dropFileObject(parentFolderFrom, user.username, el)
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
            const {element, parentFolder} = parse.parsePath(path);
            
            this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
                if(element == el.title){
                    callback(webdav.ResourceType.File)
                }
            })
            this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
                if(element == el.title){
                    callback(webdav.ResourceType.Directory)
                }
            })
        }
    }

    getSize(path, ctx, callback){

        const {element, parentFolder} = parse.parsePath(path);
        const user = ctx.context.user;

        this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
            if(element == el.title){
                callback(parse.parseSize(el.contentLength))
            }
        })
        this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
            if(element == el.title){
                callback()
            }
        })
    }

    getlastModifiedDate(path, ctx, callback){

        if(path != '/'){
            const {element, parentFolder} = parse.parsePath(path);
            const user = ctx.context.user;

            this.structСache.getStruct(parentFolder, user.username).files.forEach((el) => {
            if(element == el.title){
                callback(parse.parseDate(el.updated))
            }
            })
            this.structСache.getStruct(parentFolder, user.username).folders.forEach((el) => {
            if(element == el.title){
                callback(parse.parseDate(el.updated))
            }
            })
        }
        else{
            callback(new Date(0, 0, 0, 0, 0, 0))
        }
    }
}

module.exports = CustomVirtualResources;