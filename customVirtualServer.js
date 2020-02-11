const webdav = require('webdav-server').v2;
const data = require('./data')
const request = require('request');
const getStructDirectory = require('./getStructDirectory.js');
const RootUrl = 'http://127.0.0.1:80/api/2.0/files/@my'
const accessToken = '8AmgZR8BpZmrWqDINk/M7nvjDNuvI2uG07AMwhGg/IUuAr0+dytOxTrTSlnP9yv90WypKrW6joNF1jGStdN3oshPjJ5X5gpyrvqjODL3yIftyv9mIlXEhIybZTl1dklJM5Y0SMlgnEwOjp6wpUIVAQ=='

/*function Resourse(data)
{
    this.constructor = Resourse;
    this.props = new webdav.LocalPropertyManager(data ? data.props : undefined);
    this.locks = new webdav.LocalLockManager();
}*/

class VirtualResourse
{
    constructor(){
        this.struct = {};
    }
    readDir(url, token, callback){
        getStructDirectory(url, token, (err, st) => {
            this.struct.folders = st.folders;
            this.struct.files = st.files;
            callback(null, st)
        })
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
}

function Serializer()
{
    return{
        uid(){
            return 'qwerty'
        },
        serialize(fs, callback){
            callback(null, {
                //resourse: fs.resourse
            })
        },
        unserialize(serializedData, callback){
            const fs = new customFS();
            callback(null, fs)
        },
        constructor: Serializer
    }
}

class customFS extends webdav.FileSystem
{
    constructor(){
        super(new Serializer())
        this.props = new webdav.LocalPropertyManager();
        this.locks = new webdav.LocalLockManager();
        this.res = new VirtualResourse();
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
        console.log('>>>size>>>', path.toString())
        callback(null, 1234)
    }

    _type(path, ctx, callback) {
        const sPath = path.toString();

        if(sPath == '/'){
            callback(null, webdav.ResourceType.Directory)
        }
        else{
            let file = sPath.split('/');
            file[file.length - 1]
            this.res.getType(sPath, (err, type) => {
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
        let elemOfDir = []
        console.log('readDir')
        this.res.readDir(RootUrl, accessToken, (err, struct) => {
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

const server = new webdav.WebDAVServer({
    port: 1900,
    rootFileSystem: new customFS()
});

server.afterRequest((arg, next) => {
    console.log('>>', arg.request.method, arg.fullUri(), '>', arg.response.statusCode, arg.response.statusMessage);
    console.log('paths: ', arg.requested.path.paths)
    //console.log('request_url: ', arg.request.url)
    next();
})

server.start((s) => console.log('Ready on port', s.address().port));