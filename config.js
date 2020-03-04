/* Config */

module.exports = {
  // Port listener WebDav Server */
  portListener: 1900,

  // Logging level. Possible values: 'info', 'warn', 'error'
  levelLog: 'info',

  // Adress of community server OnlyOffice */
  domen: 'http://127.0.0.1:80/',

  // Api constant
  api: 'api/2.0/',

  // Api authentication method
  apiAuth: 'authentication.json',

  // Sub-method for files/folders operations
  apiFiles: 'files/',

  method: {

    // Get root directory in "My documents"
    pathRootDirectory: '@my',

    // Operations with folders
    folder: 'folder/',

    // Operations with files
    file: 'file/',

    // Create new file '*.txt'
    text: '/text',

    // Open edit text file. 
    openedit: '/openedit',

    // Write stream in file
    insert: '/insert?title=',

    // Property for method 'insert'
    no_createFile: '&createNewIfExist=false',

    // Method copy for files or folders
    copy: 'fileops/copy',

    // Method move for files or folders
    move: 'fileops/move',
  }
}

/*export const pathRootDirectory = '@my';
export const folder = 'folder/';
export const file = 'file/';
export const text = '/text';
export const openedit = '/openedit';
export const insert = '/insert?title=';
export const no_createFile = '&createNewIfExist=false';
export const copy = 'fileops/copy';
export const move = 'fileops/move';*/