const customSimpleUser = require('./user.js')

class customUserLayout{
    constructor(){
        this.storage = {}
    }

    setUser(username, password, token){
        this.storage[username] = new customSimpleUser('', false, false, username, password, token, new Date);
    }

    getUser(username){
        return this.storage[username]
    }

    checkExpireUser(username){
        const difference = 5000;
        const notExpire = (new Date - this.getUser(username).timetmp) < difference ? true : false
        return notExpire 
    }

    dropUser(username){
        delete this.storage[username];
    }
}

module.exports = customUserLayout;