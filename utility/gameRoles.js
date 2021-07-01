const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
const { DBUser } = utl.db
/**
 * Assing an activity role to member
 *
 * @param {Discord.Guild} guild
 * @param {Discord.Presence} oldPresence
 * @param {Discord.Presence} newPresence
 */
module.exports = async (guild, oldPresence, newPresence) => {
    if(!newPresence.user.bot) {
        const pres = newPresence.activities.find(a => a.type == 'PLAYING')
        if(pres && constants.gameRoles[pres.name] && !newPresence.member.roles.cache.has(constants.gameRoles[pres.name])) {
            const user = await new DBUser(guild.id, newPresence.userID)
            if(!user.disGameRole)
                newPresence.member.roles.add(constants.gameRoles[pres.name]).catch(err => { })
        }
    }
}