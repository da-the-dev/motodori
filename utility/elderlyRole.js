const Discord = require('discord.js')
const constants = require('../constants.json')
const { scheduleJob } = require("node-schedule")

/**
 * Give out elderly role to those 
 * @param {Discord.Guild} guild - Guild to scan
 */
module.exports = (guild) => {
    scheduleJob('0 0 * * *', () => {
        guild.members.fetch({ cache: true })
            .then(() => {
                Promise.all(guild.members.cache.map(async m => {
                    if(Date.now() - m.joinedTimestamp > 7884000 * 3 * 1000 && !m.user.bot)
                        return m.roles.add(constants.roles.elderly)
                }))
            })
    })
}