const webdav = require('webdav-server').v2;
const request = require('request');
const VirtualResources = require('./customVirtualResources/customVirtualResources');


class customFileSystem extends webdav.FileSystem
{
    constructor(){
        super()
        this.props = new webdav.LocalPropertyManager();
        this.locks = new webdav.LocalLockManager();
        this.manageResource = new VirtualResources();
    }

    _lockManager(path, ctx, callback){
        callback(null, this.locks)
    }

    _propertyManager(path, ctx, callback){
        callback(null, this.props)
    }

    _fastExistCheck(ctx, path, callback){

        const sPath = path.toString();

        this.manageResource.fastExistCheck(sPath, ctx, (exist) => {
            callback(exist)  
        })
    }

    _create(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.create(sPath, ctx, (err) => {
            if(err){
                callback(err)
            }
            callback();
        });
    }

    _delete(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.delete(sPath, ctx, (err) => {
            if(err){
                callback(err)
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

        this.manageResource.move(sPathFrom, sPathTo, ctx, (err, isMove) => {
            if(err){
                callback(err, isMove)
            }
            else{
                callback(null, isMove)
            }
        })
    }

    _copy(pathFrom, pathTo, ctx, callback){
        if(pathFrom.paths[pathFrom.paths.length - 1] == pathTo.paths[pathTo.paths.length - 1]){
            delete pathTo.paths[pathTo.paths.length - 1]
        }
        const sPathFrom = pathFrom.toString();
        const sPathTo = pathTo.toString();

        this.manageResource.copy(sPathFrom, sPathTo, ctx, (err, isCopy) => {
            if(err){
                callback(err, isCopy)
            }
            else{
                callback(null, isCopy)
            }
        })
    }

    _size(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.getSize(sPath, ctx, (size) => {
            callback(null, size)
        })
    }

    _openWriteStream(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.writeFile(sPath, ctx, (err, streamWrite) => {
            if(err){
                callback(err, null)
            }
            else{
                callback(null, streamWrite)
            }
        })
    }

    _openReadStream(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.downloadFile(sPath, ctx, (err, streamRead) => {
            if(err){
                callback(err, null)
            }
            else{
                callback(null, streamRead)
            }
        })
    }

    _type(path, ctx, callback) {
        const sPath = path.toString();

        this.manageResource.getType(sPath, ctx, (type) => {
                callback(null, type)
        })
    }

    _lastModifiedDate(path, ctx, callback){
        const sPath = path.toString();

        this.manageResource.getlastModifiedDate(sPath, ctx, (date) => {
            callback(null, date)
        })
    }

    _readDir(path, ctx, callback){
        const sPath = path.toString();
        let elemOfDir = [];

        this.manageResource.readDir(sPath, ctx, (err, struct) => {
            if(err){
                callback(err)
            }
            else{
                struct.folders.forEach(el => {
                    elemOfDir.push(el.title);
                });
                struct.files.forEach(el => {
                    elemOfDir.push(el.title);
                });
                callback(null, elemOfDir)
            }
        })
    }
}

module.exports = customFileSystem;