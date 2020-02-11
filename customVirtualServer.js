const webdav = require('webdav-server').v2;
const data = require('./data.js');

/*function Resourse(data)
{
    this.constructor = Resourse;
    this.props = new webdav.LocalPropertyManager(data ? data.props : undefined);
    this.locks = new webdav.LocalLockManager();
}*/

class VirtualResourse extends webdav.VirtualFileSystemResource
{
    constructor(){
        super(data)
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
                resources: fs.resources
            })
        },
        unserialize(serializedData, callback){
            const fs = new customFS();
            //fs.resources = serializedData.resources;
            for(const path in serializedData.resources)
            {
                fs.resources[path] = new VirtualResourse(serializedData.resources[path]);
            }
            callback(null, fs)
        },
        constructor: Serializer
    }
}

class customFS extends webdav.FileSystem
{
    constructor(){
        super(new Serializer())
        this.resources = {
            '/': new VirtualResourse('/')
        };
    }

    _lockManager(path, ctx, callback) {
        console.log('locks')
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new VirtualResourse(path.toString());
            this.resources[path.toString()] = resource;
        }
        callback(null, resource['locks'])
    }

    _propertyManager(path, ctx, callback) {
        console.log('props')
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new VirtualResourse(path.toString());
            this.resources[path.toString()] = resource;
        }
        console.log(resource['props'])
        callback(null, resource['props'])
    }

    _type(path, ctx, callback) {
        console.log('>>>resource>>>', this.resource[path.toString()]);
        const sPath = path.toString();
        console.log('>>>sPath>>>', sPath)
        let ssPath = sPath.substr(1);
        //console.log('>>>ssPath>>>', ssPath)
        if(ssPath.length > 0){
            data.struct1.forEach((t) => {
                if(ssPath.toString() == t.name){
                    callback(null, t.type == 'Directory'? webdav.ResourceType.Directory : webdav.ResourceType.File)
                }
            })
        }
        else{
            callback(null, webdav.ResourceType.Directory)
        }
        //console.log('>>>sPath>>>', sPath)
        //let ssPath = sPath.substr(1);
        //console.log('>>>ssPath>>>', ssPath)
        //callback(null, webdav.ResourceType.Directory)
    }

    _readDir(path, ctx, callback){
        let st = []
        console.log('readDir')
        data.struct1.forEach((el) => {
            st.push(el.name)
        })
        callback(null, st)
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