const webdav = require('webdav-server').v2;

class SimpleStruct
{
    constructor(){
        this.struct = {}
    }

    setStruct(path, username, struct){
        if(!this.struct){
            this.struct = {};
        }
        if(!this.struct[user]){
            this.struct[user] = {};
        }
        this.struct[username][path] = {};
        this.struct[username][path] = structDir;
        this.struct[username].lastUpdate = new Date;
    }

    getStruct(path, username){
        return this.struct[username][path]
    }
}