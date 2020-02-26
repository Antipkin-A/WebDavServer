const webdav = require('webdav-server').v2;
const {requestAuth} = require('./requestAPI.js');

class customUserManager extends webdav.SimpleUserManager
{
    constructor(){
        super()
    }

    getUserByNamePassword(username, password, callback){
        requestAuth(username, password, (err, token) => {
            if(err){
                callback(webdav.Errors.UserNotFound)
            }
            else{
                callback(null, {
                    uid: '',
                    isAdministrator: false,
                    isDefaultUser: false,
                    username: username,
                    password: password,
                    token: token
                })
            }
        })
    }
}

module.exports = customUserManager;