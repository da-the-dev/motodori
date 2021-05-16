const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
/**
 * Scans the server to make sure that all nessesary channels/messages etc are in place
 * @param {Discord.Client} client - Bot client
 */
module.exports = async (client) => {
    // Scan for private room creator channel
    /**@type {Discord.VoiceChannel} */
    const creator = client.guild.channels.cache.find(c => c.name.includes('Tap to Create +꙳'))
    if(!creator)
        utl.privateRooms.createRoom(client)
    else
        client.creator = creator.id
}