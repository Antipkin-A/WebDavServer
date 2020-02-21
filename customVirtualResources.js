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
const {pathRootDirectory} = require('./config.ts')
const streamWrite = require('./Writable.js')

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

    parseDate(dateString){
        let dateArray = dateString.split('.');
        dateArray = dateArray[0].split('T')
        let date = dateArray[0].split('-');
        let time = dateArray[1].split(':');
        return{
            date: date,
            time: time
        }
    }

    checkRename(elementFrom, elementTo, parentFolderFrom, parentFolderTo){

        let elementFromIsExist = false;
        let elementToIsExist = false;
        this.struct[parentFolderFrom].files.forEach((el) => {
            if(elementFrom == el.title){
                elementFromIsExist = true;
            }
        })
        this.struct[parentFolderFrom].folders.forEach((el) => {
            if(elementFrom == el.title){
                elementFromIsExist = true;
            }
        })
        this.struct[parentFolderTo].files.forEach((el) => {
            if(elementTo == el.title){
                elementToIsExist = true;
            }
        })
        this.struct[parentFolderTo].folders.forEach((el) => {
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

    create(path, ctx, username, password, callback){

        const {element, parentFolder} = this.parsePath(path);
        let parentId = this.struct[parentFolder].current.id;
            
            if(ctx.type.isDirectory){
                createDirectory(parentId, element, username, password, (err, st) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        this.struct[parentFolder].folders.push(st)
                        callback(null)
                    }
                })
            }
            else if(ctx.type.isFile){
                /*createFile(parentId, element, ctx, (err, el) => {
                    if(err){
                        callback(err, null);
                    }
                    console.log(el)
                    this.struct[parentFolder].files.push(el);

                    getFileDownloadUrl(parentId, el.id, ctx, (err, streamFile) => {
                        if(err){
                            callback(err, null);
                        }
    
                        callback(null, streamFile);
                    })
                })*/
                createFiletxt(parentId, element, ctx, (err, el) => {
                    if(err){
                        callback(err, null);
                    }
                    console.log(el)
                    this.struct[parentFolder].files.push(el);

                    getFileDownloadUrl(parentId, el.id, ctx, (err, streamFile) => {
                        if(err){
                            callback(err, null);
                        }
    
                        callback(null, streamFile);
                    })
                })
            }
    }

    delete(path, username, password, callback){
        const {element, parentFolder} = this.parsePath(path);

        this.struct[parentFolder].folders.forEach((el) => {
            if(element == el.title){
                deleteDirectory(el.id, username, password, (err, res) => {
                    if(err){
                        callback(err)
                    }
                    delete this.struct[parentFolder].folders.el
                    callback(null)
                })
            }
        })

        this.struct[parentFolder].files.forEach((el) => {
            if(element == el.title){
                deleteFile(el.id, username, password, (err, res) => {
                    if(err){
                        callback(err)
                    }
                    delete this.struct[parentFolder].files.el
                    callback(null)
                })
            }
        })
    }

    readDir(path, username, password, callback){
        
            if(path == '/'){
                let folderId = pathRootDirectory;
                getStructDirectory(folderId, username, password, (err, st) => {
                    if(err){
                        callback(err, null)
                    }
                    this.struct[path] = {};
                    this.struct[path].folders = st.folders;
                    this.struct[path].files = st.files;
                    this.struct[path].current = st.current;
                    callback(null, this.struct[path])
                })
            }
            else{
                const {element, parentFolder} = this.parsePath(path);

                if(!this.struct[parentFolder]){
                    this.readDir(parentFolder, null, null, callback)
                }
                else{
                    this.struct[parentFolder].folders.forEach((el) => {
                        if(element == el.title){
                            let folderId = el.id;
                            getStructDirectory(folderId, username, password, (err, st) => {
                                if(err){
                                    callback(webdav.Errors.ResourceNotFound, null)
                                }
                                this.struct[path] = {};
                                this.struct[path].folders = st.folders;
                                this.struct[path].files = st.files;
                                this.struct[path].current = st.current;
                                callback(null, this.struct[path])
                            })
                        }
                    })
                }
            }
    }

    downloadFile(path, ctx, callback){

        let fileisExist = false;
        const {element, parentFolder} = this.parsePath(path);

            this.struct[parentFolder].files.forEach((el) => {
                if(element == el.title){
                    fileisExist = true;
                    getFileDownloadUrl(el.folderId, el.id, ctx, (err, streamFile) => {
                        if(err){
                            callback(err, null);
                        }

                        callback(null, streamFile);
                    })
                }
            })
            if(!fileisExist){
                let folderId = this.struct[parentFolder].current.id;

            createFile(folderId, element, ctx, (err, el) => {
                if(err){
                    callback(err, null);
                }

                this.struct[parentFolder].files.push(el);
                getFileDownloadUrl(folderId, el.id, ctx, (err, streamFile) => {
                    if(err){
                        callback(err, null);
                    }

                    callback(null, streamFile);
                })
            })
            }
    }

    writeFile(path, ctx, callback){

        const {element, parentFolder} = this.parsePath(path);
        let folderId = this.struct[parentFolder].current.id;

        const content = [];
        const stream = new streamWrite(content);

        stream.on('finish', () => {
            this.struct[parentFolder].files.forEach((el) => {
                if(element == el.title){
                    rewritingFile(folderId, el.title, content, (err, res) => {
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

        let {element, parentFolder} = this.parsePath(pathFrom);

        if(!this.struct[pathTo]){
                    this.readDir(pathTo, null, null, (err, st) => {
                        if(err){
                            console.log('Error read dir')
                        }
                        if(this.struct[pathTo]){
                            const folderId = this.struct[pathTo].current.id;
                            this.struct[parentFolder].folders.forEach((el) => {
                            if(element == el.title){
                                copyDirToFolder(folderId, el.id, (err, res) => {
                                    if(err){
                                        callback(err, null)
                                    }
                                    callback(null, true)
                                })
                            }
                            })
                            this.struct[parentFolder].files.forEach((el) => {
                                if(element == el.title){
                                    copyFileToFolder(folderId, el.id, (err, res) => {
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
            const folderId = this.struct[pathTo].current.id;
            this.struct[parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    copyDirToFolder(folderId, el.id, (err, res) => {
                        if(err){
                            callback(err, null)
                        }
                        callback(null, true)
                    })
                }
            })
            this.struct[parentFolder].files.forEach((el) => {
                if(element == el.title){
                    copyFileToFolder(folderId, el.id, (err, res) => {
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

        let {element, parentFolder} = this.parsePath(path);

        this.struct[parentFolder].folders.forEach((el) => {
            if(element == el.title){
                renameFolder(el.id, newName, (err, rename) => {
                    if(err){
                        callback(err, null)
                    }
                    callback(null, true)
                })
            }
        })
        this.struct[parentFolder].files.forEach((el) => {
            if(element == el.title){
                renameFile(el.id, newName, (err, rename) => {
                    if(err){
                        callback(err, null)
                    }
                    console.log(rename)
                    callback(null, true)
                })
            }
        })

    }

    move(pathFrom, pathTo, ctx, callback){

        let {element: elementFrom, parentFolder: parentFolderFrom} = this.parsePath(pathFrom);
        let {element: elementTo, parentFolder: parentFolderTo} = this.parsePath(pathTo);

        if(parentFolderFrom == parentFolderTo){
            var {isRename} = this.checkRename(elementFrom, elementTo, parentFolderFrom, parentFolderTo)
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
            if(!this.struct[pathTo]){
                this.readDir(pathTo, null, null, (err, st) => {
                    if(err){
                        console.log('Error read dir')
                    }
                    if(this.struct[pathTo]){
                        const folderId = this.struct[pathTo].current.id;
                        this.struct[parentFolderFrom].folders.forEach((el) => {
                        if(elementFrom == el.title){
                            moveDirToFolder(folderId, el.id, (err, res) => {
                                if(err){
                                    callback(err, null)
                                }
                                callback(null, true)
                            })
                        }
                        })
                        this.struct[parentFolderFrom].files.forEach((el) => {
                            if(elementFrom == el.title){
                                moveFileToFolder(folderId, el.id, (err, res) => {
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
                const folderId = this.struct[pathTo].current.id;
                this.struct[parentFolderFrom].folders.forEach((el) => {
                    if(elementFrom == el.title){
                        moveDirToFolder(folderId, el.id, (err, res) => {
                            if(err){
                                callback(err, null)
                            }
                            callback(null, true)
                        })
                    }
                })
                this.struct[parentFolderFrom].files.forEach((el) => {
                    if(elementFrom == el.title){
                        moveFileToFolder(folderId, el.id, (err, res) => {
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

        let fileisExist = false;

        if(path == '/'){
            fileisExist = true;
            callback(null, webdav.ResourceType.Directory)
        }
        else{
            const {element, parentFolder} = this.parsePath(path);

            this.struct[parentFolder].files.forEach((el) => {
                if(element == el.title){
                    fileisExist = true;
                    callback(null, webdav.ResourceType.File)
                }
            })
            this.struct[parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    fileisExist = true;
                    callback(null, webdav.ResourceType.Directory)
                }
            })
        }
        if(!fileisExist){
            callback(webdav.Errors.ResourceNotFound, null)
        }
    }

    getSize(path, ctx, callback){

        const {element, parentFolder} = this.parsePath(path);
        let fileisExist = false;

        this.struct[parentFolder].files.forEach((el) => {
            if(element == el.title){
                fileisExist = true;
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
        if(!fileisExist){
            callback(webdav.Errors.ResourceNotFound, null)
        }
    }

    getlastModifiedDate(path, ctx, callback){

        if(path != '/'){
            let fileisExist = false;
            const {element, parentFolder} = this.parsePath(path);

            this.struct[parentFolder].files.forEach((el) => {
            if(element == el.title){
                fileisExist = true;
                const {date, time} = this.parseDate(el.updated)
                callback(null, new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]))
            }
            })
            this.struct[parentFolder].folders.forEach((el) => {
            if(element == el.title){
                fileisExist = true;
                const {date, time} = this.parseDate(el.updated)
                callback(null, new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]))
            }
            })
            if(!fileisExist){
                callback(webdav.Errors.ResourceNotFound, null)
            }
        }
        else{
            callback(null, new Date(0, 0, 0, 0, 0, 0))
        }
    }
}

module.exports = CustomVirtualResources;