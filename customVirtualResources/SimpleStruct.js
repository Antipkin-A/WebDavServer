const {timeIsCleanTrash} = require('../config.js');

class SimpleStruct
{
    constructor(){
        this.struct = {}
    }

    setStruct(path, username, structDir){
        if(!this.struct){
            this.struct = {};
        }
        if(!this.struct[username]){
            this.struct[username] = {};
        }
        this.struct[username][path] = {};
        this.struct[username][path] = structDir;
        this.struct[username].lastUpdate = new Date;
    }

    getStruct(path, username){
        try{
            if(!this.struct[username][path]){
                return false
            }
            else return this.struct[username][path]
        }
        catch{
            return false
        }
    }

    isCleanTrash(username){
        try{
            const liveTime = timeIsCleanTrash;
            const isClean =  ((new Date - this.struct[username].lastUpdate) > liveTime) ? true : false;
            return isClean
        }
        catch{
            return false
        }
    }

    cleanTrash(users){
        users.forEach(user => {
            if(this.isCleanTrash(user)){
                delete this.struct[user];
            }
        })
    }

    setFileObject(path, username, newFile){
        this.struct[username][path].files.push(newFile)
        this.struct[username].lastUpdate = new Date;
    }

    setFolderObject(path, username, newFile){
        this.struct[username][path].folders.push(newFile)
        this.struct[username].lastUpdate = new Date;
    }

    dropFileObject(Folder, username, file){
        this.struct[username][Folder].files.forEach(el => {
            if(el.id == file.id){
                const id = this.struct[username][Folder].files.indexOf(el)
                delete this.struct[username][Folder].files[id]
                this.struct[username].lastUpdate = new Date;
            }
        })
    }

    dropFolderObject(Folder, username, folder){
        this.struct[username][Folder].folders.forEach(el => {
            if(el.id == folder.id){
                const id = this.struct[username][Folder].folders.indexOf(el)
                delete this.struct[username][Folder].folders[id]
                this.struct[username].lastUpdate = new Date;
            }
        })
    }

    dropPath(path, username){
        delete this.struct[username][path]
        this.struct[username].lastUpdate = new Date;
    }

    checkRename(elementFrom, elementTo, parentFolderFrom, parentFolderTo, user){

        let elementFromIsExist = false;
        let elementToIsExist = false;
        this.struct[user.username][parentFolderFrom].files.forEach((el) => {
            if(elementFrom == el.title){
                elementFromIsExist = true;
            }
        })
        this.struct[user.username][parentFolderFrom].folders.forEach((el) => {
            if(elementFrom == el.title){
                elementFromIsExist = true;
            }
        })
        this.struct[user.username][parentFolderTo].files.forEach((el) => {
            if(elementTo == el.title){
                elementToIsExist = true;
            }
        })
        this.struct[user.username][parentFolderTo].folders.forEach((el) => {
            if(elementTo == el.title){
                elementToIsExist = true;
            }
        })
        const isRename = (elementFromIsExist && !elementToIsExist && (parentFolderFrom == parentFolderTo)) ? true : false;
        return isRename
    }

    renameFolderObject(element, newName, parentFolder, username){
        this.struct[username][parentFolder].folders.forEach(el => {
            if(el.title == element){
                const id = this.struct[username][parentFolder].folders.indexOf(el)
                this.struct[username][parentFolder].folders[id].title = newName;
                this.struct[username].lastUpdate = new Date;
            }
        })
    }

    renameFileObject(element, newName, parentFolder, username){
        this.struct[username][parentFolder].files.forEach(el => {
            if(el.title == element){
                const id = this.struct[username][parentFolder].files.indexOf(el)
                this.struct[username][parentFolder].files[id].title = newName;
                this.struct[username].lastUpdate = new Date;
            }
        })
    }

    structIsExpire(path, parentFolder, username){
        if(!this.struct[username][path]){
            return false
        }
        else{
            const difference = 1000;
            const notExpire = (new Date - this.struct[username].lastUpdate) < difference ? true : false
            return notExpire
        }
    }
}

module.exports = SimpleStruct;