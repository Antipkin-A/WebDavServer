const webdav = require('webdav-server').v2;
const {
    getStructDirectory,
    createDirectory,
    deleteDirectory
} = require('./requestAPI.js');
const {pathRootDirectory} = require('./config.ts')

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

    create(path, username, password, callback){

        const {element, parentFolder} = this.parsePath(path);

        //If we step or copy.... to unread directory, you must read it
        if(!this.struct[parentFolder]){

            this.readDir(parentFolder, username, password, (err, struct) => {
                if(err){
                    console.log('Error read dir')
                }

                let parentId = this.struct[parentFolder].current.id;
                
                createDirectory(parentId, element, username, password, (err, st) => {
                    if(err){
                        callback(err)
                    }
                    else{
                        console.log('добавляю структуру: ', st)
                        this.struct[parentFolder].folders.push(st)
                        callback(null)
                    }
                })
            })
        }
        else{
            let parentId = this.struct[parentFolder].current.id;
            
            createDirectory(parentId, element, username, password, (err, st) => {
                if(err){
                    callback(err)
                }
                else{
                    console.log('добавляю структуру: ', st)
                    this.struct[parentFolder].folders.push(st)
                    callback(null)
                }
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
        //}
    }

    getType(path, method, callback){
        if(path == '/'){
            callback(null, 'Directory')
        }
        if(method == 'MKCOL'){
            callback(null, 'Directory')
        }
        else{
            const {element, parentFolder} = this.parsePath(path);

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
    }

    getSize(path, callback){
        const {element, parentFolder} = this.parsePath(path);

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
        this.struct[parentFolder].folders.forEach((el) => {
            if(element == el.title){
                callback(null, 1)
            }
        })
    }
}

module.exports = CustomVirtualResources;