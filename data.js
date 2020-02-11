let struct1 = 
    [
        {
            name: "folder1",
            type: 'Directory',
            size: 100,
            lastModifiedDate: new Date(2011, 0, 1, 2, 3, 4)          

        },
        {
            name: 'qwerty.jpg',
            type: 'File',
            size: 150,
            lastModifiedDate: 10
        },
        {
            name: 'ewfeed.jpg',
            type: 'File',
            size: 125,
            lastModifiedDate: 10
        }
    ]
    let struct2 = 
    [
        {
            name: 'referat.docx',
            type: 'File',
            size: 153,
            lastModifiedDate: 10
        },
        {
            name: 'yellow.png',
            type: 'File',
            size: 213344,
            lastModifiedDate: 10
        }
    ]

    module.exports.struct1 = struct1;
    module.exports.struct2 = struct2;