const webdav = require('webdav-server').v2;
const data = require('./data.js');

function Resourse(data)
{
    this.constructor = Resourse;
    this.props = new webdav.LocalPropertyManager(data ? data.props : undefined);
    this.locks = new webdav.LocalLockManager();
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
            /*for(const path in fs.resources)
            {
                fs.resources[path] = new Resource(fs.resources[path]);
            }*/
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
            '/': new Resourse()
        };
    }

    _lockManager(path, ctx, callback) {
        console.log('locks')
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new Resourse();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource['locks'])
    }

    _propertyManager(path, ctx, callback) {
        console.log('props')
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new Resourse();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource['props'])
    }

    _type(path, ctx, callback) {
        console.log('>>>resourse>>>', this.resource[path])
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

/*function customFS()
{
    const r = new webdav.FileSystem(new Serializer());
    r.constructor = customFS;
    //r.resources = new Resourse();

    r._lockManager = function(path, ctx, callback) {
        console.log('locks')
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new Resource();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource['locks'])
    }
    r._propertyManager = function(path, ctx, callback) {
        console.log('props')
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new Resource();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource['props'])
    }
    r._type = function(path, ctx, callback) {
        callback(null, webdav.ResourceType.Directory)
    }
    r._readDir = function(path, ctx, callback){
        callback(null, ['1', '2', '3'])
    }
}*/

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