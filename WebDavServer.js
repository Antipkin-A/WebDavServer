const webdav = require('webdav-server').v2;
const FileSystem = require('./customFileSystem');
const {portListener} = require('./config.ts')

const server = new webdav.WebDAVServer({
    port: portListener,
    rootFileSystem: new FileSystem()
});

server.afterRequest((arg, next) => {
    console.log('>>', arg.request.method, arg.fullUri(), '>', arg.response.statusCode, arg.response.statusMessage);
    next();
})

server.start((s) => console.log('Ready on port', s.address().port));