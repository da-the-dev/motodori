const { Message } = require('discord.js')
const constants = require('../constants.json')

const regex = /(\.com)|(\.or)(\.ru)|(\.org)|(https:\/\/)|(http:\/\/)/g

module.exports.init = () => {
    guild.roles.cache.get(constants.roles.chatControl)
}
/**
 * Deletes a message if it contains a link
 * @param {Message} message 
 */
module.exports = message => {
    const txtControl = message.guild.roles.cache.get(constants.roles.chatControl)
    txtControl ? console.log(txtControl.position) : console.log('TXT mod not found!')
    // const txtControl = message.guild.roles.cache.get(constants.roles.chatControl)
    // if(!message.member.roles.cache.find(r => r.position >= txtControl.position)
    //     && !message.member.roles.cache.has(constants.roles.pics)
    //     && regex.test(message.content))
    //     message.delete()
}
