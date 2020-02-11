const webdav = require('webdav-server').v2;
const data = require('./data.js');

/*function PhysicalResourse(data)
{
    this.props = new webdav.LocalPropertyManager(data ? data.props : undefined);
    this.locks = new webdav.LocalLockManager();
}

function PhysicalSerializer()
{
    return{
        uid(){
            return 'qwerty';
        },

        serialize(fs, callback){
            callback(null, {resources: fs.resources})
        },

        unserialize(serializeData, callback){
            const fs = new customFS();
            fs.resources = serializeData.resources;
            callback(null, fs);
        }
    }
}*/

function customFS(path)
{
    //const fs = new webdav.PhysicalFileSystem(new PhysicalSerializer());
    const fs = new webdav.PhysicalFileSystem(path);
    fs.constructor = customFS;
    //fs.resources = new PhysicalResourse();
    /*fs.getPropertyFromResource = function(path, ctx, propertyName, callback)
    {
        //let resource = this.resources[path.toString()];
        //if(!resource)
        //{
            resource = new webdav.PhysicalFileSystemResource();
            this.resources[path.toString()] = resource;
       // }

        callback(null, resource[propertyName]);
    }

    fs._propertyManager = function(path, ctx, callback)
    {
        console.log('props')
        this.getPropertyFromResource(path, ctx, 'props', callback);
    }

    fs._lockManager = function(path, ctx, callback)
    {
        console.log('locks')
        this.getPropertyFromResource(path, ctx, 'locks', callback);
    }

    fs._type = function(path, ctx, callback)
    {
        console.log('type')
        callback(null, webdav.ResourceType.File)
    }

    fs._size = function(path, ctx, callback)
    {
        console.log('size')
        callback(null, 1234)
    }*/

    /*fs.getRealPath = function(path)
    {
        const sPath = path.toString() + '/Users';
        const rPath = '/' + path.toString();
        return{
            realPath: sPath,
            resource: this.resources[rPath] 
        }
    }*/

    /*fs._readDir = function(path, ctx, callback)
    {
        let ee = []
        console.log('readDir paths', '>> ', path.paths)
        data.struct1.forEach((el) => {
            el = el.name;
            ee.push(el)
            console.log(ee)
        })
        callback(null, ee)
    }*/

    return fs
}

const server = new webdav.WebDAVServer({
    port: 1900,
    rootFileSystem: new customFS('/')
});

server.afterRequest((arg, next) => {
    console.log('>>', arg.request.method, arg.fullUri(), '>', arg.response.statusCode, arg.response.statusMessage);
    console.log('paths: ', arg.requested.path.paths)
    //console.log('request_url: ', arg.request.url)
    next();
})

server.start((s) => console.log('Ready on port', s.address().port));