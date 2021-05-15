const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
/**
 * Scans the server to make sure that all nessesary channels/messages etc are in place
 * @param {Discord.Client} client - Bot client
 */
module.exports = async (client) => {
    var server = client.guilds.cache.first()

    // Scan for private room creator channel
    /**@type {Discord.CategoryChannel} */
    var caterory = server.channels.cache.get(constants.categories.privateRooms)
    var creator = caterory.children.find(c => c.name.includes('Создать'))
    if(!creator)
        utl.privateRooms.createRoom(client)
    else
        client.creator = creator.id

    // Get verify 
    client.verify = await client.guilds.cache.first().roles.fetch(constants.roles.verify, true, true)
}