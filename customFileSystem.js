const webdav = require('webdav-server').v2;
const request = require('request');
const VirtualResources = require('./customVirtualResources');
//const rootUrl = `http://127.0.0.1:80/api/2.0/files/@my`
//let folderIdUrl = `http://127.0.0.1:80/api/2.0/files/${folderId}`;
const accessToken = '8AmgZR8BpZmrWqDINk/M7nvjDNuvI2uG07AMwhGg/IUuAr0+dytOxTrTSlnP9yv9Jw9Mt+2lZRHqGNYf0TOr2pZF1QPolkgA4+yU82+tRJzXs9qjNU7zzK52BG6XBj6ITWx1QicXoNXoI5/mZo6hCg=='


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

    _move(pathFrom, pathTo, ctx, callback){
        if(pathFrom.paths[pathFrom.paths.length - 1] == pathTo.paths[pathTo.paths.length - 1]){
            delete pathTo.paths[pathTo.paths.length - 1]
        }
        const sPathFrom = pathFrom.toString();
        const sPathTo = pathTo.toString();

        this.manageResource.move(sPathFrom, sPathTo, ctx, (err, res) => {
            if(err){
                callback(err, false)
            }
            callback(null, true)
        })
    }

    _copy(pathFrom, pathTo, ctx, callback){
        if(pathFrom.paths[pathFrom.paths.length - 1] == pathTo.paths[pathTo.paths.length - 1]){
            delete pathTo.paths[pathTo.paths.length - 1]
        }
        const sPathFrom = pathFrom.toString();
        const sPathTo = pathTo.toString();

        this.manageResource.copy(sPathFrom, sPathTo, ctx, (err, res) => {
            if(err){
                callback(err, false)
            }
            callback(null, true)
        })
    }

    _size(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.getSize(sPath, ctx, (err, size) => {
            callback(null, size)
        })
    }

    _openWriteStream(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.writeFile(sPath, ctx, (err, stream) => {
            if(err){
                callback(err, null)
            }
            callback(null, stream)
        })
    }

    _openReadStream(path, ctx, callback){
        const sPath = path.toString();

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

    _lastModifiedDate(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.getlastModifiedDate(sPath, ctx, (err, date) => {
            callback(null, date)
        })
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
            callback(null, elemOfDir)
        })
    }
}

module.exports = customFileSystem;