const webdav = require('webdav-server').v2;
const data = require('./data.js')

var customFileSystemResourse = function(data)
    {
        this.props = new webdav.LocalPropertyManager(data ? data.props : undefined);
        this.locks = new webdav.LocalLockManager();
    }

// Serializer
function customFileSystemSerializer()
{
    return {
        uid()
        {
            return "customFileSystemSerializer_1.0.0";
        },
        serialize(fs, callback)
        {
            //console.log(fs)
            callback(null, {
                type_doc: fs.type_doc,
                size_doc: fs.size_doc,
                lastModifiedDate_doc: fs.lastModifiedDate_doc,
                props: fs.props,
                resources: fs.resources
            });
        },
        unserialize(serializedData, callback)
        {
            const fs = new customFileSystem(serializedData.type_doc, serializedData.size_doc, serializedData.lastModifiedDate_doc);
            fs.props = serializedData.props;
            fs.resources = serializedData.resources;
            /*for(const path in serializedData.resources)
            {
                serializedData[path] = new customFileSystemResourse(serializedData.resources[path]);
            }*/
            callback(null, fs);
        },
        constructor: customFileSystemSerializer
    }
}

// File system
function customFileSystem()
{
    const r = new webdav.FileSystem(new customFileSystemSerializer());
    r.constructor = customFileSystem;
    r.props = new webdav.LocalPropertyManager();
    //r.props = {};
    r.locks = new webdav.LocalLockManager();
    r.resources = new customFileSystemResourse();

    //r._parse = function()

    r._fastExistCheck = function(ctx, path, callback)
    {
        //console.log(path.paths)
        callback(path);
    }

    r._openReadStream = function(path, info, callback)
    {
        const stream = request.get('http://unlicense.org/UNLICENSE');
        console.log('>>stream_before_end()>>', stream)
        stream.end();
        console.log('>>stream_after_end()>>', stream)
        //let stream = 'ewgraehethtshntghrehaerg'
        callback(null, stream);
    }

    r._propertyManager = function(path, info, callback)
    {
        callback(null, this.props);
    }

    r._lockManager = function(path, info, callback)
    {
        callback(null, this.locks);
    }

    r._type = function(path, info, callback)
    {
        console.log('проверяем типы')
        callback(null, webdav.ResourceType.File);
    }

    r._size = function(ctx, path, callback)
    {
        callback(null, 1234)
    }

    r._lastModifiedDate = function(ctx, path, callback)
    {
        callback(null, new Date(2011, 0, 1, 2, 3, 4))
    }
    
    r._readDir = function(path, ctx, callback)
    {
        let Paths = [];
        data.struct1.forEach((el) => {
            Paths.push((el.name).toString())
        })
        callback(null, Paths)
    }

    return r;
}

const server = new webdav.WebDAVServer({
    port: 1900,
    rootFileSystem: new customFileSystem()
});

server.afterRequest((arg, next) => {
    console.log('>>', arg.request.method, arg.fullUri(), '>', arg.response.statusCode, arg.response.statusMessage);
    server.setFileSystem('/1', new customFileSystem());
    next();
})

server.start((s) => console.log('Ready on port', s.address().port));