const webdav = require('webdav-server').v2;
const request = require('request');
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
} = require('./requestAPI.js');
const {pathRootDirectory} = require('./config.ts');
const streamWrite = require('./Writable.js');

class CustomVirtualResources
{
    constructor(){
        this.struct = {};
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
        if(elementFromIsExist && !elementToIsExist && (parentFolderFrom == parentFolderTo)){
            return{
                isRename: true
            }
         }
        else return{
            isRename: false
        }
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
                    callback(false);
                }
            }
            catch{
                callback(false);
            }
        }
    }

    create(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = this.parsePath(path);
        let parentId = this.struct[user.username][parentFolder].current.id;
            
            if(ctx.type.isDirectory){
                createDirectory(parentId, element, user.token, (err, st) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        this.struct[user.username][parentFolder].folders.push(st)
                        callback(null)
                    }
                })
            }
            else if(ctx.type.isFile){
                /*createFile(parentId, element, user.token, (err, el) => {
                    if(err){
                        callback(err, null);
                    }
                    console.log(el)
                    this.struct[user.username][parentFolder].files.push(el);

                    getFileDownloadUrl(parentId, el.id, user.token, (err, streamFile) => {
                        if(err){
                            callback(err, null);
                        }
                        callback(null, streamFile);
                    })
                })*/
                createFiletxt(parentId, element, user.token, (err, el) => {
                    if(err){
                        callback(err, null);
                    }
                    this.struct[user.username][parentFolder].files.push(el);

                    getFileDownloadUrl(parentId, el.id, user.token, (err, streamFile) => {
                        if(err){
                            callback(err, null);
                        }
                        callback(null, streamFile);
                    })
                })
            }
    }

    delete(path, ctx, callback){

        const user = ctx.context.user;
        const {element, parentFolder} = this.parsePath(path);

        this.struct[user.username][parentFolder].folders.forEach((el) => {
            if(element == el.title){
                deleteDirectory(el.id, user.token, (err, res) => {
                    if(err){
                        callback(err)
                    }
                    delete this.struct[user.username][parentFolder].folders.el
                    callback(null)
                })
            }
        })

        this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                deleteFile(el.id, user.token, (err, res) => {
                    if(err){
                        callback(err)
                    }
                    delete this.struct[user.username][parentFolder].files.el
                    callback(null)
                })
            }
        })
    }

    readDir(path, ctx, callback){

        const user = ctx.context.user;
        
            if(path == '/'){
                let folderId = pathRootDirectory;
                getStructDirectory(folderId, user.token, (err, st) => {
                    if(err){
                        callback(err, null)
                    }
                    if(!this.struct){
                        this.struct = {};
                    }
                    if(!this.struct[user.username]){
                        this.struct[user.username] = {};
                    }
                    this.struct[user.username][path] = {};
                    this.struct[user.username][path] = st;
                    callback(null, this.struct[user.username][path])
                })
            }
            else{
                const {element, parentFolder} = this.parsePath(path);

                if(!this.struct[user.username][parentFolder]){
                    this.readDir(parentFolder, ctx, callback)
                }
                else{
                    this.struct[user.username][parentFolder].folders.forEach((el) => {
                        if(element == el.title){
                            let folderId = el.id;
                            getStructDirectory(folderId, user.token, (err, st) => {
                                if(err){
                                    callback(webdav.Errors.ResourceNotFound, null)
                                }
                                if(!this.struct){
                                    this.struct = {};
                                }
                                if(!this.struct[user.username]){
                                    this.struct[user.username] = {};
                                }
                                this.struct[user.username][path] = {};
                                this.struct[user.username][path] = st;
                                callback(null, this.struct[user.username][path])
                            })
                        }
                    })
                }
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
                    rewritingFile(folderId, el.title, content, user.token, (err, res) => {
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

        if(!this.struct[user.username][pathTo]){
            this.readDir(pathTo, ctx, (err, st) => {
                if(err){
                    callback(err, null)
                }
                if(this.struct[user.username][pathTo]){
                const folderId = this.struct[user.username][pathTo].current.id;
                this.struct[user.username][parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    copyDirToFolder(folderId, el.id, user.token, (err, res) => {
                        if(err){
                            callback(err, null)
                        }
                        callback(null, true)
                        })
                }
                })
                this.struct[user.username][parentFolder].files.forEach((el) => {
                    if(element == el.title){
                        copyFileToFolder(folderId, el.id, user.token, (err, res) => {
                            if(err){
                                callback(err, null)
                            }
                            callback(null, true)
                        })
                    }
                    })
                }
                else{
                    this.copy(pathFrom, pathTo, ctx, callback)
                }
            })
        }
        else{
            const folderId = this.struct[user.username][pathTo].current.id;
            this.struct[user.username][parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    copyDirToFolder(folderId, el.id, user.token, (err, res) => {
                        if(err){
                            callback(err, null)
                        }
                        callback(null, true)
                    })
                }
            })
            this.struct[user.username][parentFolder].files.forEach((el) => {
                if(element == el.title){
                    copyFileToFolder(folderId, el.id, user.token, (err, res) => {
                        if(err){
                            callback(err, null)
                        }
                        callback(null, true)
                    })
                }
            })
        }
    }

    rename(path, newName, ctx, callback){

        const user = ctx.context.user;
        let {element, parentFolder} = this.parsePath(path);

        this.struct[user.username][parentFolder].folders.forEach((el) => {
            if(element == el.title){
                renameFolder(el.id, newName, user.token, (err, rename) => {
                    if(err){
                        callback(err, null)
                    }
                    callback(null, true)
                })
            }
        })
        this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                renameFile(el.id, newName, user.token, (err, rename) => {
                    if(err){
                        callback(err, null)
                    }
                    callback(null, true)
                })
            }
        })

    }

    move(pathFrom, pathTo, ctx, callback){
        
        pathTo = this.parsePathTo(pathTo);
        let {element: elementFrom, parentFolder: parentFolderFrom} = this.parsePath(pathFrom);
        let {element: elementTo, parentFolder: parentFolderTo} = this.parsePath(pathTo);
        const user = ctx.context.user;

        if(parentFolderFrom == parentFolderTo){
            var {isRename} = this.checkRename(elementFrom, elementTo, parentFolderFrom, parentFolderTo, user)
        }
        else{
            var isRename = false;
        }

        if(isRename){
           this.rename(pathFrom, elementTo, ctx, (err, rename) => {
               if(err){
                   callback(err, null)
               }
               callback(null, true)
           })
        }
        else{
            if(!this.struct[user.username][pathTo]){
                this.readDir(pathTo, ctx, (err, st) => {
                    if(err){
                        callback(err, null)
                    }
                    if(this.struct[user.username][pathTo]){
                        const folderId = this.struct[user.username][pathTo].current.id;
                        this.struct[user.username][parentFolderFrom].folders.forEach((el) => {
                        if(elementFrom == el.title){
                            moveDirToFolder(folderId, el.id, user.token, (err, res) => {
                                if(err){
                                    callback(err, null)
                                }
                                callback(null, true)
                            })
                        }
                        })
                        this.struct[user.username][parentFolderFrom].files.forEach((el) => {
                            if(elementFrom == el.title){
                                moveFileToFolder(folderId, el.id, user.token, (err, res) => {
                                    if(err){
                                        callback(err, null)
                                    }
                                    callback(null, true)
                                })
                            }
                            })
                    }
                    else{
                        this.move(pathFrom, pathTo, ctx, callback)
                    }
                })
            }
            else{
                const folderId = this.struct[user.username][pathTo].current.id;
                this.struct[user.username][parentFolderFrom].folders.forEach((el) => {
                    if(elementFrom == el.title){
                        moveDirToFolder(folderId, el.id, user.token, (err, res) => {
                            if(err){
                                callback(err, null)
                            }
                            callback(null, true)
                        })
                    }
                })
                this.struct[user.username][parentFolderFrom].files.forEach((el) => {
                    if(elementFrom == el.title){
                        moveFileToFolder(folderId, el.id, user.token, (err, res) => {
                            if(err){
                                callback(err, null)
                            }
                            callback(null, true)
                        })
                    }
                })
            }
        }
    }

    getType(path, ctx, callback){

        const user = ctx.context.user;

        if(path == '/'){
            callback(null, webdav.ResourceType.Directory)
        }
        else{
            const {element, parentFolder} = this.parsePath(path);
            
            this.struct[user.username][parentFolder].files.forEach((el) => {
                if(element == el.title){
                    callback(null, webdav.ResourceType.File)
                }
            })
            this.struct[user.username][parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    callback(null, webdav.ResourceType.Directory)
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
                        callback(null, Number(size))
                        break
                    case 'KB':
                        callback(null, Number(size) * 1000)
                        break
                    case 'MB':
                        callback(null, Number(size) * 1000000)
                        break
                }
            }
        })
    }

    getlastModifiedDate(path, ctx, callback){

        if(path != '/'){
            const {element, parentFolder} = this.parsePath(path);
            const user = ctx.context.user;

            this.struct[user.username][parentFolder].files.forEach((el) => {
            if(element == el.title){
                callback(null, this.parseDate(el.updated))
            }
            })
            this.struct[user.username][parentFolder].folders.forEach((el) => {
            if(element == el.title){
                callback(null, this.parseDate(el.updated))
            }
            })
        }
        else{
            callback(null, new Date(0, 0, 0, 0, 0, 0))
        }
    }
}

module.exports = CustomVirtualResources;