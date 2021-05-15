const constants = require('../constants.json')
const Discord = require('discord.js')
const utl = require('../utility')

/**
 * Reapply roles on server entry
 * @param {Discord.GuildMember} member 
 */
module.exports.reapplyRoles = (member) => {
    utl.db.createClient(process.env.MURL).then(db => {
        db.get(member.guild.id, member.id).then(userData => {
            db.close()
            if(userData) {
                var collectedRoles = []
                // Reapply roles
                if(userData.mute)
                    collectedRoles.push(constants.roles.muted)
                if(userData.toxic)
                    collectedRoles.push(constants.roles.toxic)
                if(userData.ban)
                    collectedRoles.push(constants.roles.localban)
                if(userData.pic)
                    collectedRoles.push(constants.roles.pics)

                member.roles.add(collectedRoles).then(() => {
                    console.log(member.displayName, 'applied roles:', collectedRoles != [] ? collectedRoles : 'none')
                })
            }
        })
    })
}