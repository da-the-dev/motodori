const { Message } = require('discord.js')
const constants = require('../constants.json')

const regex = /(\.com)|(\.or)(\.ru)|(\.org)|(https:\/\/)|(http:\/\/)/g

/**
 * Deletes a message if it contains a link
 * @param {Message} message 
 */
module.exports = message => {
    return 
    const txtControl = message.guild.roles.cache.get(constants.roles.chatControl)
    if(!message.member.roles.cache.find(r => r.position >= txtControl.position)
        && !message.member.roles.cache.has(constants.roles.pics)
        && regex.test(message.content))
        message.delete()
}
