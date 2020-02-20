const webdav = require('webdav-server').v2;
const request = require('request');
const {
    getStructDirectory,
    createDirectory,
    deleteDirectory,
    getFileDownloadUrl,
    createFile,
    deleteFile,
    rewritingFile,
    copyDirToFolder,
    copyFileToFolder,
    moveDirToFolder,
    moveFileToFolder
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
                createFile(parentId, element, ctx, (err, el) => {
                    if(err){
                        callback(err, null);
                    }
    
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
                                    callback(err, null)
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

    move(pathFrom, pathTo, ctx, callback){

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
                                moveDirToFolder(folderId, el.id, (err, res) => {
                                    if(err){
                                        callback(err, null)
                                    }
                                    callback(null, true)
                                })
                            }
                            })
                            this.struct[parentFolder].files.forEach((el) => {
                                if(element == el.title){
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
            this.struct[parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    moveDirToFolder(folderId, el.id, (err, res) => {
                        if(err){
                            callback(err, null)
                        }
                        callback(null, true)
                    })
                }
            })
            this.struct[parentFolder].files.forEach((el) => {
                if(element == el.title){
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

    getType(path, ctx, callback){

        let fileisExist = false;
        let method = ctx.context.request.method;

        if(path == '/'){
            callback(null, 'Directory')
        }
        else if(method == 'MKCOL'){
            fileisExist = true;
            callback(null, 'Directory')
        }
        else{
            const {element, parentFolder} = this.parsePath(path);

            this.struct[parentFolder].files.forEach((el) => {
                if(element == el.title){
                    fileisExist = true;
                    callback(null, 'File')
                }
            })
            this.struct[parentFolder].folders.forEach((el) => {
                if(element == el.title){
                    fileisExist = true;
                    callback(null, 'Directory')
                }
            })
        }
        if(!fileisExist){
            callback(null, 'File')
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
        this.struct[parentFolder].folders.forEach((el) => {
            if(element == el.title){
                fileisExist = true;
                callback(null, 1)
            }
        })
        if(!fileisExist){
            callback(null, 1)
        }
    }

    getlastModifiedDate(path, ctx, callback){

        if(path != '/'){
            const {element, parentFolder} = this.parsePath(path);

            this.struct[parentFolder].files.forEach((el) => {
            if(element == el.title){
                let updatedArray = el.updated.split('.');
                updatedArray = updatedArray[0].split('T')
                let date = updatedArray[0].split('-');
                let time = updatedArray[1].split(':');
                callback(null, new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]))
            }
            })
            this.struct[parentFolder].folders.forEach((el) => {
            if(element == el.title){
                let updatedArray = el.updated.split('.');
                updatedArray = updatedArray[0].split('T')
                let date = updatedArray[0].split('-');
                let time = updatedArray[1].split(':');
                callback(null, new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]))
            }
            })
        }
        else{
            callback(null, new Date(0, 0, 0, 0, 0, 0))
        }
    }
}

module.exports = CustomVirtualResources;