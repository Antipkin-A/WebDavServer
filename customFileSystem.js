const webdav = require('webdav-server').v2;
const request = require('request');
const VirtualResources = require('./customVirtualResources');
//const rootUrl = `http://127.0.0.1:80/api/2.0/files/@my`
//let folderIdUrl = `http://127.0.0.1:80/api/2.0/files/${folderId}`;
//const accessToken = '8AmgZR8BpZmrWqDINk/M7nvjDNuvI2uG07AMwhGg/IUuAr0+dytOxTrTSlnP9yv90WypKrW6joNF1jGStdN3oshPjJ5X5gpyrvqjODL3yIftyv9mIlXEhIybZTl1dklJM5Y0SMlgnEwOjp6wpUIVAQ=='

/*function Serializer()
{
    return{
        uid(){
            return 'customFSByOnlyOffice'
        },
        serialize(fs, callback){
            callback(null, {
                //resourse: fs.resourse
            })
        },
        unserialize(serializedData, callback){
            const fs = new customFileSystem();
            callback(null, fs)
        },
        constructor: Serializer
    }
}*/

class customFileSystem extends webdav.FileSystem
{
    constructor(){
        super(/*new Serializer()*/)
        this.props = new webdav.LocalPropertyManager();
        this.locks = new webdav.LocalLockManager();
        this.manageResource = new VirtualResources();
    }

    _lockManager(path, ctx, callback) {
        console.log('locks')
        callback(null, this.locks)
    }

    _propertyManager(path, ctx, callback) {
        console.log('props')
        callback(null, this.props)
    }



    _size(path, ctx, callback){
        const sPath = path.toString();
        this.manageResource.getSize(sPath, (err, size) => {
            callback(null, size)
        })
    }

    _type(path, ctx, callback) {
        const sPath = path.toString();

        if(sPath == '/'){
            callback(null, webdav.ResourceType.Directory)
        }
        else{
            this.manageResource.getType(sPath, (err, type) => {
                if(type == 'Directory'){
                    callback(null, webdav.ResourceType.Directory)
                }
                else{
                    callback(null, webdav.ResourceType.File)
                }
            })
        }
    }

    _readDir(path, ctx, callback){
        const sPath = path.toString();

        let elemOfDir = []
        console.log(ctx.context.user.username, ctx.context.user.password)
        this.manageResource.readDir(sPath, ctx.context.user.username, ctx.context.user.password, (err, struct) => {
            struct.folders.forEach(el => {
                elemOfDir.push(el.title);
            });
            struct.files.forEach(el => {
                elemOfDir.push(el.title);
            });
            callback(null, elemOfDir)
        })
    }
}

module.exports = customFileSystem;

/*const server = new webdav.WebDAVServer({
    port: 1900,
    rootFileSystem: new customFS()
});

server.afterRequest((arg, next) => {
    console.log('>>', arg.request.method, arg.fullUri(), '>', arg.response.statusCode, arg.response.statusMessage);
    console.log('paths: ', arg.requested.path.paths)
    //console.log('request_url: ', arg.request.url)
    next();
})

server.start((s) => console.log('Ready on port', s.address().port));*/