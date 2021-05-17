require('dotenv').config()

const emmiter = require('events')
const MongoClient = require('mongodb').MongoClient
/**@type {Array<DBServer|DBUser>} */
var connections = []

class Connection {
    /**@type {MongoClient} */
    #connection

    /**
     * Establishes a connection via promise
     * @returns {Promise<Connection>}
     */
    constructor() {
        return new Promise(async (resolve, reject) => {
            this.#connection = await new MongoClient(process.env.MURL, { useNewUrlParser: true, useUnifiedTopology: true }).connect()
            resolve(this)
        })
    }
    close() {
        if(this.#connection.isConnected())
            this.#connection.close()
    }

    ////// BASIC METODS \\\\\\
    /**
     * Gets data about a key from a guild
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @return {Promise<any>} Info about the key
     */
    get(guildID, uniqueID) {
        return new Promise(async (resolve, reject) => {
            if(!guildID) reject('No guild ID [get]!')
            if(!uniqueID) reject('No unique ID [get]!')

            var res = this.#connection.db('motodori').collection(guildID).findOne({ id: uniqueID })

            res ? (
                res._id ? delete res._id : null,
                res.id ? delete res.id : null
            ) : res = {}

            resolve(res)
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

            this.get(guildID, uniqueID).then(async res => {
                const newData = { ...{ id: uniqueID }, ...data }
                if(res) {
                    this.#connection.db('motodori').collection(guildID).findOneAndReplace({ id: uniqueID }, newData).then(() => {
                        resolve('OK')
                    })
                } else {
                    this.#connection.db('motodori').collection(guildID).insertOne(newData).then(() => {
                        resolve('OK')
                    })
                }
            })
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
            this.#connection.db('motodori').collection(guildID).find(query).toArray()
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }
}


class DBUser {
    /**@type {Connection} DB connection*/ #connection
    /**@type {string} User's guild ID*/ #guildID
    /**@type {string} User's ID*/ #id

    /**@type {number} Money */ money
    /**@type {number} Amount of messages in general*/ msgs
    /**@type {number} Amount of messages in general in daytime*/ dayMsgs
    /**@type {number} Amount of messages in general in nighttime*/ nightMsgs
    /**@type {number} Minutes spent in voice channels*/ voiceTime
    /**@type {number} Minutes spent in voice channels during daytime*/ dayVoiceTime
    /**@type {number} Minutes spent in voice channels during nighttime*/ nightVoiceTime
    /**@type {Array<Role>} Inventory of shop roles*/ inv
    /**@type {Array<CustomRole>} Inventory of custom roles*/ customInv
    /**@type {Array<Warn>}  Array of warns*/ warns
    /**@type {boolean} If banned*/ ban
    /**@type {boolean} If toxic*/ toxic
    /**@type {boolean} If muted*/ mute
    /**@type {string} Custom status*/ status
    /**@type {LoveRoom} Love room*/ loveroom

    /**
    * Retrieves data about a user
    * @param {string} guildID
    * @param {string} id
    * @return {Promise<DBUser>}
    */
    constructor(guildID, id, connection) {
        return new Promise(async (resolve, reject) => {
            this.#guildID = guildID
            this.#id = id
            // connections.push(this)

            this.#connection = connection
            const userData = await this.#connection.get(guildID, id)

            this.money = userData.money
            this.msgs = userData.msgs
            this.dayMsgs = userData.dayMsgs
            this.nightMsgs = userData.nightMsgs
            this.voiceTime = userData.voiceTime
            this.dayVoiceTime = userData.dayVoiceTime
            this.nightVoiceTime = userData.nightVoiceTime
            this.inv = userData.inv
            this.customInv = userData.customInv
            this.warns = userData.warns
            this.ban = userData.ban
            this.toxic = userData.toxic
            this.mute = userData.mute
            this.status = userData.status
            this.loveroom = userData.loveroom
            resolve(this)
        })
    }

    get() {
        /**@type {UserData}*/ var userData = {}

        this.#id ? userData.id = this.#id : null
        this.money ? userData.money = this.money : null
        this.msgs ? userData.msgs = this.msgs : null
        this.dayMsgs ? userData.dayMsgs = this.dayMsgs : null
        this.nightMsgs ? userData.nightMsgs = this.nightMsgs : null
        this.voiceTime ? userData.voiceTime = this.voiceTime : null
        this.dayVoiceTime ? userData.dayVoiceTime = this.dayVoiceTime : null
        this.nightVoiceTime ? userData.nightVoiceTime = this.nightVoiceTime : null
        if(this.inv && this.inv.length > 0) userData.inv = this.inv
        if(this.customInv && this.customInv.length > 0) userData.customInv = this.customInv
        if(this.warns && this.warns.length > 0) userData.warns = this.warns
        this.ban ? userData.ban = this.ban : null
        this.toxic ? userData.toxic = this.toxic : null
        this.mute ? userData.mute = this.mute : null
        this.status ? userData.status = this.status : null
        this.loveroom ? userData.loveroom = this.loveroom : null

        return userData
    }

    save() {
        return new Promise(async (resolve, reject) => {
            await this.#connection.set(this.#guildID, this.#id, this.get())
            resolve('OK')
        })
    }
}

class DBServer {
    /**@type {Connection} DB connection*/ #connection
    /**@type {string} User's guild ID*/ #guildID

    /**@type {boolean}  - Defenses flag*/ def
    /**@type {Role[]}  - Array of shop roles*/ roles
    /**@type {CustomRole[]}  - Array of custom roles*/ customRoles

    /**
    * Retrieves data about a server
    * @param {string} guildID
    * @param {Connection} con
    * @returns {Promise<DBServer>}
    */
    constructor(guildID, con) {
        return new Promise(async (resolve, reject) => {
            this.#guildID = guildID
            this.#connection = con

            const serverData = await this.#connection.get(guildID, 'serverSettings')

            this.def = serverData.def
            this.roles = serverData.roles
            this.customRoles = serverData.customRoles

            resolve(this)
        })
    }

    get() {
        /**@type {ServerData}*/ var serverData = {}

        this.def ? serverData.def = this.def : null
        this.roles ? serverData.roles = this.roles : null
        this.customRoles ? serverData.customRoles = this.customRoles : null

        return serverData
    }

    save() {
        return new Promise(async (resolve, reject) => {
            await this.#connection.set(this.#guildID, 'serverSettings', this.get())
            resolve('OK')
        })
    }
}

/**
 * Retrieves guild user data
 * @param {string} guildID - Guild ID
 * @param {Connection} con
 * @returns {Promise<UserData[]>} Guild data
 */
function getGuild(guildID, con) {
    return new Promise(async (resolve, reject) => {
        var guildData = await con.getMany(guildID, { id: { $regex: /^\d+$/ } })
        guildData.forEach(u => {
            u._id ? delete u._id : null
        })
        resolve(guildData)
    })
}

module.exports.Connection = Connection
module.exports.DBUser = DBUser
module.exports.DBServer = DBServer
module.exports.getGuild = getGuild

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

// *User*
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