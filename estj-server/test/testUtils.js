const fs = require('fs')

module.exports = {
    readTestFile: (fileName) => {
        return JSON.parse(fs.readFileSync(`./test/data/${fileName}`, 'utf8'))
    }
}
