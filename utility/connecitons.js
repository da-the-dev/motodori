const { Connection } = require('../utility/db')
const { RedisConnection } = require('../utility/redisConnection')

/**
 * Starts a few connections
 *
 * @param {number} amount 
 */
module.exports.startconnections = async (amount) => {
    const connectionPromises = []
    for(let i = 0; i < amount; i++)
        connectionPromises.push(new Connection())
    const rConnectionPromises = []
    for(let i = 0; i < 1; i++)
        rConnectionPromises.push(new RedisConnection())


    await Promise.all(connectionPromises)
    await Promise.all(rConnectionPromises)
}

/**
 * Closes all open connections
 */
module.exports.closeConnections = () => {
    Connection.closeAll()
    RedisConnection.closeAll()
}