const mongoose = require('mongoose')

module.exports = {
    databaseName: null,

    closeDb: async () => {
        await mongoose.connection.close()
    },

    /**
     * Connect to the Mongo DB
     * @param {String} dbName - name of the Mongo DB
     * @returns {Promise<void>}
     */
    connectToDB: async (dbName) => {
        this.databaseName = dbName

        const connectOpts = {
            useNewUrlParser: true,    // uses port number in DSN
            useFindAndModify: false,  // findAndModify uses MongoDB's findAndModify
            useUnifiedTopology: true
        }
        const url = `mongodb://127.0.0.1/${this.databaseName}`
        await mongoose.connect(url, connectOpts)
    },

    /**
     * Removes the data from all collections
     * @returns {Promise<void>}
     */
    removeCollectionData: async () => {
        const collections = Object.keys(mongoose.connection.collections)
        for (const collectionName of collections) {
            const collection = mongoose.connection.collections[collectionName]
            await collection.deleteMany({})
        }
    }
}


