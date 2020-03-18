const customSimpleUser = require('./customSimpleUser.js')
const {timeIsCleanTrash} = require('../config.js');

class customUserLayout{
    constructor(){
        this.storage = new Map()
    }

    setUser(username, password, token){
        this.storage.set(username, new customSimpleUser('', false, false, username, password, token, new Date))
    }

    getUser(username){
        return this.storage.get(username)
    }

    checkExpireUser(username){
        const difference = 50000;
        const notExpire = (new Date - this.getUser(username).timetmp) < difference ? true : false
        return notExpire 
    }

    dropUser(){
        this.storage.delete(username);
    }

    isCleanTrashUsers(username){
        const liveTime = timeIsCleanTrash;
        const isClean =  ((new Date - this.getUser(username).timetmp) > liveTime) ? true : false;
        return isClean
    }

    cleanTrashUsers(callback){
        let trashUsers = [];
        this.storage.forEach(el => {
            if(this.isCleanTrashUsers(el.username)){
                this.storage.delete(el.username);
                trashUsers.push(el.username)
            }
            callback(trashUsers)
        })
    }
}

module.exports = customUserLayout;