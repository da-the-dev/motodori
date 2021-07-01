require('dotenv').config()
const redis = require('redis')
const { promisify } = require('util')

/**@type {RedisConnection[]} */
const connections = []

/**
 * @returns {RedisConnection}
 */
function getRedCon() {
    return connections.find(c => c.isAvalible())
}

class RedisConnection {
    /**@type {redis.RedisClient} */
    #connection

    static closeAll() {
        connections.forEach(c => c.close())
    }

    constructor() {
        this.#connection = redis.createClient(process.env.RURL)
        connections.push(this)
    }
    close() {
        this.#connection.quit()
    }
    isAvalible() {
        return this.#connection.connected
    }

    /**
     * Get data from redis DB
     *
     * @param {string} key 
     * @returns {any}
     */
    async get(key) {
        const get = promisify(this.#connection.get).bind(this.#connection)
        return await get(key)
    }
    /**
     * Set data to redis DB
     *
     * @param {string} key 
     * @param {string} data
     */
    async set(key, data) {
        const set = promisify(this.#connection.set).bind(this.#connection)
        await set(key, data)
    }

    /**
     * Get key's lifespan (Time To Live)
     *
     * @param {string} key
     * @returns
     */
    async ttl(key) {
        const ttl = promisify(this.#connection.ttl).bind(this.#connection)
        return await ttl(key)
    }
    /**
     * Set key's lifespan (expiration date)
     *
     * @param {string} key 
     * @param {number} duration - in seconds
     */
    async expire(key, duration) {
        const expire = promisify(this.#connection.expire).bind(this.#connection)
        await expire(key, duration)
    }

    /**
     * Delete key
     *
     * @param {string} key 
     */
    async delete(key) {
        const del = promisify(this.#connection.del).bind(this.#connection)
        await del(key)
    }
}

module.exports = { RedisConnection, getRedCon }

