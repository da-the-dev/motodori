const MongoClient = require('mongodb').MongoClient

class DB {
    static saveAll() {
        return new Promise(async (resolve, reject) => {
            var promises = []
            connections.map(c => {
                return c.save()
            })

            await Promise.all(promises)
            resolve('OK')
        })
    }
    /**@type {MongoClient} */
    #connection
    /**
     * Start a connection
     * @param {string} url - Connection URL
     */
    constructor(url) {
        return (async () => {
            this.#connection = await new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true }).connect()
            return this
        })();
    }
    /**
     * Closes connection to current DB
     * @returns Returns 'OK' once disconnected
     */
    close = async () => {
        await this.#connection.close()
        return 'OK'
    }

    ////// BASIC METODS \\\\\\
    /**
     * Gets data about a key from a guild
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @return {Promise<any>} Info about the key
     */
    get(guildID, uniqueID) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [get]!')
            if(!uniqueID) reject('No unique ID [get]!')

            var res = this.#connection.db('hoteru').collection(guildID).findOne({ id: uniqueID })
                .then(res => {
                    res ? (
                        res._id ? delete res._id : null,
                        res.id ? delete res.id : null
                    ) : res = {}
                    resolve(res)
                })
        })
    }
    /**
     * Set data about a key from a guild
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @param {object} data - Data to set
     * @returns {Promise<string>} Returns 'OK' if set succesfully
     */
    set(guildID, uniqueID, data) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [set]!')
            if(!uniqueID) reject('No unique ID [set]!')
            if(!data) reject('No data to set [set]!')

            this.get(guildID, uniqueID).then(res => {
                const newData = { ...{ id: uniqueID }, ...data }
                if(res) {
                    this.#connection.db('hoteru').collection(guildID).findOneAndReplace({ id: uniqueID }, newData).then(() => {
                        resolve('OK')
                    })
                } else {
                    this.#connection.db('hoteru').collection(guildID).insertOne(newData).then(() => {
                        resolve('OK')
                    })
                }
            })
        })
    }
    /**
     * Update data about a key from a guild
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @param {object} query - Queries to update
     * @returns {Promise<string>} Returns 'OK' if update succesfully
     */
    update(guildID, uniqueID, query) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [update]!')
            if(!uniqueID) reject('No unique ID [update]!')
            if(!query) reject('No query to update [update]!')

            this.#connection.db('hoteru').collection(guildID).updateOne({ id: uniqueID }, query, { upsert: true })
                .then(() => resolve('OK'))
                .catch(err => reject(err))
        })
    }
    /**
     * Deletes a document
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @return {Promise<string>} 'OK' if deleted succesfully 
     */
    delete(guildID, uniqueID) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [delete]!')
            if(!uniqueID) reject('No unique ID [delete]!')

            this.#connection.db('hoteru').collection(guildID).deleteOne({ id: uniqueID })
                .then(() => resolve('OK'))
                .catch(err => reject(err))
        })
    }

    /**
     * Gets data about many keys from a guild
     * @param {string} guildID - Guild ID
     * @param {object} query - Query to use as a filter
     * @return {Promise<Array<any>>} Info about the keys
     */
    getMany(guildID, query) {
        return new Promise((resolve, reject) => {
            this.#connection.db('hoteru').collection(guildID).find(query).toArray()
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }
    /**
     * Updates data about many keys from a guild
     * @param {string} guildID - Guild ID
     * @param {object} filter - Query to use as a filter
     * @param {object} update - Query to update documents with
     * @return {Promise<any>} Info about the keys
     */
    updateMany(guildID, filter, update) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [updateMany]!')
            if(!filter) reject('No filter [updateMany]!')
            if(!update) reject('No update query [updateMany]!')
            this.#connection.db('hoteru').collection(guildID).updateMany(filter, update, { upsert: true })
                .then(() => resolve('OK'))
                .catch(err => reject(err))
        })
    }
}

/**
 * 
 * @param {dbCallback} func 
 * @returns {Promise<string>}
 */
module.exports.execute = (func) => {
    return new Promise(async (resolve, reject) => {
        const db = await new DB(process.env.MURL)
        await func(db)
        db.close()
        resolve('OK')
    })
}


/**
 * @callback dbCallback
 * @param {DB} db
 */

// **Custom types**

// *Roles*
/**
* Shop role
* @typedef Role
* @property {string} id - Role ID
* @property {number} price - Role's price
*/
/**
 * Custom role
 * @typedef CustomRole
 * @property {string} id - Role ID
 * @property {string} owner - Role's owner ID
 * @property {string} createdTimestamp - Creation timestamp
 * @property {number} expireTimestamp - Expiration timestamp
 * @property {number} members - Amount of members who have this role in their inventories
 */

// *Misc*
/**
 * Server data
 * @typedef ServerData
 * @property {boolean} def - Defenses flag
 * @property {Array<Role>} roles - Array of shop roles
 * @property {Array<CustomRole>} customRoles - Array of custom roles
 */
/**
 * Warn data
 * @typedef Warn
 * @property {string} reason - Reason for a warn
 * @property {string} who - ID of the user who warned
 * @property {number} time - Timestamp of when the warn was given
 */
/**
 * @typedef LoveRoom
 * @property {string} id - Love room's channel ID
 * @property {string} partner - ID of a partner
 * @property {number} creationDate - Creation date of a love room
 * @property {number} bal - Balance of a room
 */

/**
 * @typedef UserData User data
 * @property {string} id User ID
 * @property {number} money Money
 * @property {number} msgs Amount of messages in general
 * @property {number} dayMsgs mount of messages in general in daytime
 * @property {number} nightMsgs Amount of messages in general in nighttime
 * @property {number} voiceTime Minutes spent in voice channels
 * @property {number} dayVoiceTime Minutes spent in voice channels during daytime
 * @property {number} nightVoiceTime Minutes spent in voice channels during nighttime
 * @property {Array<Role>} inv Inventory of shop roles
 * @property {Array<CustomRole>} customInv nventory of custom roles
 * @property {Array<Warn>} warns Array of warns
 * @property {boolean} ban If banned
 * @property {boolean} toxic If toxic
 * @property {boolean} mute If muted
 * @property {string} status Custom status
 * @property {LoveRoom} loveroom Love room
 */