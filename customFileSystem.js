const webdav = require('webdav-server').v2;
const request = require('request');
const VirtualResources = require('./customVirtualResources');
//const rootUrl = `http://127.0.0.1:80/api/2.0/files/@my`
//let folderIdUrl = `http://127.0.0.1:80/api/2.0/files/${folderId}`;
//const accessToken = '8AmgZR8BpZmrWqDINk/M7nvjDNuvI2uG07AMwhGg/IUuAr0+dytOxTrTSlnP9yv90WypKrW6joNF1jGStdN3oshPjJ5X5gpyrvqjODL3yIftyv9mIlXEhIybZTl1dklJM5Y0SMlgnEwOjp6wpUIVAQ=='


class customFileSystem extends webdav.FileSystem
{
    constructor(){
        super(/*new Serializer()*/)
        this.props = new webdav.LocalPropertyManager();
        this.locks = new webdav.LocalLockManager();
        this.manageResource = new VirtualResources();
    }

    _lockManager(path, ctx, callback) {
        callback(null, this.locks)
    }

    _propertyManager(path, ctx, callback) {
        callback(null, this.props)
    }

    /*_rename(pathFrom, newName, ctx, callback){
        console.log(pathFrom, newName, '>>>>>>>>rename>>>>>>>>>')
    }*/

    _create(path, ctx, callback){
        const sPath = path.toString();
        console.log('create path: ', sPath)
        this.manageResource.create(sPath, ctx.context.user.username, ctx.context.user.password, (err) => {
            if(err){
                callback(webdav.Errors.IntermediateResourceMissing)
            }
            callback();
        });
    }

    _size(path, ctx, callback){
        console.log('<<<<SSSSIIIIZEEEEE>>>>>')
        const sPath = path.toString();
        this.manageResource.getSize(sPath, (err, size) => {
            callback(null, size)
        })
    }

    _openReadStream(path, ctx, callback){
        console.log('>>>>>Reader>>>>>>')
    }

    _type(path, ctx, callback) {
        const sPath = path.toString();

        if(sPath == '/'){
            callback(null, webdav.ResourceType.Directory)
        }
        else{
            //console.log('>>Call method _type<<', '>>method: ' + ctx.context.request.method + ' >>url: ' + ctx.context.request.url)
            let method = ctx.context.request.method;
            let url = ctx.context.request.url;
            this.manageResource.getType(sPath, method, (err, type) => {
                if(type == 'Directory'){
                    callback(null, webdav.ResourceType.Directory)
                }
                else{
                    callback(null, webdav.ResourceType.File)
                }
            })
        }
        //callback(null, webdav.ResourceType.Directory)
    }

    _readDir(path, ctx, callback){
        const sPath = path.toString();

        let elemOfDir = []
        this.manageResource.readDir(sPath, ctx.context.user.username, ctx.context.user.password, (err, struct) => {
            struct.folders.forEach(el => {
                elemOfDir.push(el.title);
            });
            struct.files.forEach(el => {
                elemOfDir.push(el.title);
            });
            //console.log(elemOfDir)
            callback(null, elemOfDir)
        })
    }
}

module.exports = customFileSystem;