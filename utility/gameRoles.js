const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
/**
 * Assing an activity role to member
 * @param {Discord.Presence} oldPresence
 * @param {Discord.Presence} newPresence
 */
module.exports = (oldPresence, newPresence) => {
    if(!newPresence.user.bot) {
        var pres = newPresence.activities.find(a => a.type == 'PLAYING')
        if(pres && constants.gameRoles[pres.name] && !newPresence.member.roles.cache.has(constants.gameRoles[pres.name])) {
            utl.db.createClient(process.env.MURL).then(db => {
                db.get(newPresence.member.guild.id, newPresence.member.id).then(userData => {
                    if(userData && !userData.gameRoles)
                        newPresence.member.roles.add(constants.gameRoles[pres.name]).catch(err => { })
                    db.close()
                })
            })
        }
    }
}