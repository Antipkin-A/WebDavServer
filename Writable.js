const { Writable } = require('stream');

class streamWrite extends Writable
{
    constructor(contents){
        super(null);
        this.contents = contents;
    }

    _write(chunk, encoding, callback){
        this.contents.push(chunk);
        callback(null);
    }
}

module.exports = streamWrite