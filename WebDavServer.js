const webdav = require('webdav-server').v2;
const FileSystem = require('./customFileSystem');
const customUserManager = require('./customUserManager');
const {portListener} = require('./config.js');

const userManager = new customUserManager();

const server = new webdav.WebDAVServer({
    port: portListener,
    requireAuthentification: true,
    httpAuthentication: new webdav.HTTPBasicAuthentication(userManager),
    rootFileSystem: new FileSystem()
});
server.afterRequest((arg, next) => {
    console.log('>>', arg.user.username, arg.request.method, arg.fullUri(), '>', arg.response.statusCode, arg.response.statusMessage);
    next();
})

server.start((s) => console.log('Ready on port', s.address().port));