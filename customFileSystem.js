const webdav = require('webdav-server').v2;
const request = require('request');
const VirtualResources = require('./customVirtualResources');
//const rootUrl = `http://127.0.0.1:80/api/2.0/files/@my`
//let folderIdUrl = `http://127.0.0.1:80/api/2.0/files/${folderId}`;
//const accessToken = '8AmgZR8BpZmrWqDINk/M7nvjDNuvI2uG07AMwhGg/IUuAr0+dytOxTrTSlnP9yv90WypKrW6joNF1jGStdN3oshPjJ5X5gpyrvqjODL3yIftyv9mIlXEhIybZTl1dklJM5Y0SMlgnEwOjp6wpUIVAQ=='


class customFileSystem extends webdav.FileSystem
{
    constructor(){
        super()
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

        this.manageResource.create(sPath, ctx, ctx.context.user.username, ctx.context.user.password, (err) => {
            if(err){
                callback(webdav.Errors.IntermediateResourceMissing)
            }
            callback();
        });
    }

    _delete(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.delete(sPath, ctx.context.user.username, ctx.context.user.password, (err) => {
            if(err){
                callback(webdav.Errors.IntermediateResourceMissing)
            }
            callback();
        })
    }

    /*_move(path, ctx, callback){
        console.log('MMMOOOOVVEEEE')
        const sPath = path.toString();
    }*/

    _size(path, ctx, callback){
        console.log('<<<<SSSSIIIIZEEEEE>>>>>')
        const sPath = path.toString();
        
        this.manageResource.getSize(sPath, ctx, (err, size) => {
            callback(null, size)
        })
    }

    _openWriteStream(path, ctx, callback){
        console.log('>>>>>Writer>>>>>>')
        console.log('path: ', path);
        console.log('ctx: ', ctx);
    }

    _openReadStream(path, ctx, callback){
        const sPath = path.toString();
        console.log('>>>>>Reader>>>>>>')

        this.manageResource.downloadFile(sPath, ctx, (err, file) => {
            callback(null, file)
        })
    }

    _type(path, ctx, callback) {
        const sPath = path.toString();

        if(sPath == '/'){
            callback(null, webdav.ResourceType.Directory)
        }
        else{
            //console.log('>>Call method _type<<', '>>method: ' + ctx.context.request.method + ' >>url: ' + ctx.context.request.url)
            this.manageResource.getType(sPath, ctx, (err, type) => {
                if(type == 'Directory'){
                    callback(null, webdav.ResourceType.Directory)
                }
                else{
                    callback(null, webdav.ResourceType.File)
                }
            })
        }
    }

    /*_lastModifiedDate(path, ctx, callback){
        
    }*/

    _readDir(path, ctx, callback){
        const sPath = path.toString();
        console.log('readdir')
        let elemOfDir = []
        this.manageResource.readDir(sPath, ctx.context.user.username, ctx.context.user.password, (err, struct) => {
            struct.folders.forEach(el => {
                elemOfDir.push(el.title);
            });
            struct.files.forEach(el => {
                elemOfDir.push(el.title);
            });
            console.log(elemOfDir)
            callback(null, elemOfDir)
        })
    }
}

module.exports = customFileSystem;