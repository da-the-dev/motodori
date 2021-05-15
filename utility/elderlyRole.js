const Discord = require('discord.js')
const constants = require('../constants.json')
const { scheduleJob } = require("node-schedule")

/**
 * Give out elderly role to those 
 * @param {Discord.Guild} guild - Guild to scan
 */
module.exports = (guild) => {
    scheduleJob('0 0 * * *', () => {
        console.log('elderly job start')
        guild.members.fetch({ cache: true })
            .then(() => {
                guild.members.cache.forEach(async m => {
                    console.log(m.displayName, Date.now() - m.joinedTimestamp, Date.now() - m.joinedTimestamp > 7.884e+9)
                    if(Date.now() - m.joinedTimestamp > 7884000 * 1000 && !m.user.bot) {
                        await m.roles.add(constants.roles.elderly)
                    }
                })
            })
        console.log('elderly job end')
    })
}