const { Message } = require('discord.js')
const constants = require('../constants.json')

const regex = /(\.com)|(\.or)(\.ru)|(\.org)|(https:\/\/)|(http:\/\/)/g

/**
 * Deletes a message if it contains a link
 * @param {Message} m 
 */
module.exports = m => {
    if(regex.test(m.content))
        if(!m.member.roles.cache.find(r => r.position >= m.guild.roles.cache.get(constants.roles.eventer).position)
            && !m.member.roles.cache.has(constants.roles.pics))
            m.delete()
}