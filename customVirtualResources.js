const webdav = require('webdav-server').v2;
const {
    getStructDirectory,
    createDirectory
} = require('./requestAPI.js');
const {pathRootDirectory} = require('./config.ts')

class CustomVirtualResources
{
    constructor(){
        this.struct = {};
    }
    create(path, username, password, callback){
        let pathArray = path.split('/');
        let element = pathArray.pop();
        if(pathArray.length <= 1){
            pathArray[0] = '/'
        }
        let parentFolder = pathArray.join('/');
        let parentId = this.struct[parentFolder].current.id;
        console.log('parentFolder: ', parentFolder)
        console.log('element: ', element)
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

    readDir(path, username, password, callback){
        if(this.struct[path]){
            callback(null, this.struct[path])
        }
        else{
            console.log(path)
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
                let pathArray = path.split('/');
                let element = pathArray.pop();
                if(pathArray.length <= 1){
                    pathArray[0] = '/'
                }
                let parentFolder = pathArray.join('/');

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

    getType(path, method, callback){
        if(path == '/'){
            callback(null, 'Directory')
        }
        if(method == 'MKCOL'){
            callback(null, 'Directory')
        }
        let pathArray = path.split('/');
        let element = pathArray.pop();
        if(pathArray.length < 2){
            pathArray[0] = '/'
        }
        let parentFolder = pathArray.join('/');
        this.struct[parentFolder].files.forEach((el) => {
            if(element == el.title){
                callback(null, 'File')
            }
        })
        this.struct[parentFolder].folders.forEach((el) => {
            if(element == el.title){
                callback(null, 'Directory')
            }
        })
    }

    getSize(path, callback){
        let pathArray = path.split('/');
        let element = pathArray.pop();
        if(pathArray.length < 2){
            pathArray[0] = '/'
        }
        let parentFolder = pathArray.join('/');
        this.struct[parentFolder].files.forEach((el) => {
            if(element == el.title){
                let sizeArray = el.contentLength.split(' ');
                let dimension = sizeArray[sizeArray.length -1];
                let size = sizeArray[sizeArray.length -2];
                switch(dimension){
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
}

module.exports = CustomVirtualResources;