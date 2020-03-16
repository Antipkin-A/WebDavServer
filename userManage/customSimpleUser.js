class customSimpleUser{
    constructor(uid, isAdministrator, isDefaultUser,
                username, password, token){
                    this.uid = uid
                    this.isAdministrator = isAdministrator
                    this.isDefaultUser = isDefaultUser
                    this.username = username
                    this.password = password
                    this.token = token
                    this.timetmp = new Date()
    }
}

module.exports = customSimpleUser;