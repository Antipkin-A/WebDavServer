const webdav = require('webdav-server').v2;
const FileSystem = require('./customFileSystem');
const customUserManager = require('./userManage/customUserManager');
const {
    portListener,
    cleanTrashInterval} = require('./config.js');
const logger = require('./logger.js');

const userManager = new customUserManager();

const server = new webdav.WebDAVServer({
    port: portListener,
    requireAuthentification: true,
    httpAuthentication: new webdav.HTTPBasicAuthentication(userManager),
    rootFileSystem: new FileSystem()
});

setInterval(function(){userManager.storeUser.cleanTrashUsers(function(users){
    server.fileSystems['/'].manageResource.structСache.cleanTrash(users)
})}, cleanTrashInterval)

server.afterRequest((arg, next) => {
    logger.log('info', `>> ${arg.user.username} ${arg.request.method} ${arg.fullUri()} > ${arg.response.statusCode} ${arg.response.statusMessage}`);
    next();
})

server.start((s) => console.log('Ready on port', s.address().port));