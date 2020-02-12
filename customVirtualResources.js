const webdav = require('webdav-server').v2;
const {getStructDirectory} = require('./requestAPI.js');
const {pathRootDirectory} = require('./config.ts')

class CustomVirtualResources
{
    constructor(){
        this.struct = {};
    }
    readDir(path, username, password, callback){
        console.log(path)
        if(path == '/'){
            let folderId = pathRootDirectory;
            getStructDirectory(folderId, username, password, (err, st) => {
                if(err){
                    callback(err, null)
                }
                this.struct.folders = st.folders;
                this.struct.files = st.files;
                callback(null, st)
            })
        }
        else{
            let pathArray = path.split('/');
            let element = pathArray[pathArray.length - 1]
            this.struct.folders.forEach((el) => {
                if(element == el.title){
                    let folderId = el.id;
                    getStructDirectory(folderId, username, password, (err, st) => {
                        if(err){
                            callback(err, null)
                        }
                        this.struct.folders = st.folders;
                        this.struct.files = st.files;
                        callback(null, st)
                    })
                }
            })
        }
    }

    getType(path, callback){
        let pathArray = path.split('/');
        let element = pathArray[pathArray.length - 1]
        this.struct.files.forEach((el) => {
            if(element == el.title){
                callback(null, 'File')
            }
        })
        this.struct.folders.forEach((el) => {
            if(element == el.title){
                callback(null, 'Directory')
            }
        })
    }

    getSize(path, callback){
        let pathArray = path.split('/');
        let element = pathArray[pathArray.length - 1]
        this.struct.files.forEach((el) => {
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