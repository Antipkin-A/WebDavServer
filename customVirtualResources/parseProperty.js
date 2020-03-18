class parseProperty{
    static parsePath(path){
        let pathArray = path.split('/');
        let targetElement = pathArray.pop();
        if(pathArray.length <= 1){
            pathArray[0] = '/'
        }
        let parentPath = pathArray.join('/');
        return{
            element: targetElement,
            parentFolder: parentPath
        }
    }

    static parsePathTo(pathTo){
        let pathArray = pathTo.split('/')
        if(pathArray[pathArray.length - 1] == '' && pathTo !== '/'){
            pathArray.pop();
            var newPath = pathArray.join('/')
        }
        else{
            var newPath = pathTo;
        }
        return newPath
    }

    static parseDate(dateString){
        let dateArray = dateString.split('.');
        dateArray = dateArray[0].split('T')
        let date = dateArray[0].split('-');
        let time = dateArray[1].split(':');
        return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2])
    }

    static parseSize(sizeString){
        let sizeArray = sizeString.split(' ');
        let dimension = sizeArray[sizeArray.length -1];
        let size = sizeArray[sizeArray.length -2];
        switch(dimension){
            case 'bytes':
                return Number(size)
                break
            case 'KB':
                return (Number(size) * 1000)
                break
            case 'MB':
                return (Number(size) * 1000000)
                break
        }
    }

    static parseFileExst(fileName){
        let nameArray = fileName.split('.')
        let exst = nameArray[nameArray.length - 1];
        if(exst == 'txt' || exst == 'html'){
            return exst
        }
        else if(exst == 'docx' || exst == 'xlsx' || exst == 'pptx'){
            return 'OFFICE_DOCX_PPTX_XLSX'
        }
    }
}

module.exports = parseProperty;