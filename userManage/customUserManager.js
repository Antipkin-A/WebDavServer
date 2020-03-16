const webdav = require('webdav-server').v2;
const {requestAuth} = require('../requestAPI/requestAPI.js');
const customUserLayout = require('./customUserLayout.js')
const User = require('./user.js')

class customUserManager extends webdav.SimpleUserManager
{
    constructor(){
        super()
        this.storeUser = new customUserLayout();
    }

    getUserByNamePassword(username, password, callback){
        if(this.storeUser.getUser(username) && this.storeUser.checkExpireUser(username)){
            callback(null, this.storeUser.getUser(username))
            console.log('тоотже юзер')
        }
        else{
            requestAuth(username, password, (err, token) => {
                if(err){
                    callback(webdav.Errors.UserNotFound)
                }
                else{
                    console.log('сменил')
                    this.storeUser.setUser(username, password, token);
                    callback(null, this.storeUser.getUser(username))
                } 
            })
        }
    }
}

module.exports = customUserManager;