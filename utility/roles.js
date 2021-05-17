const constants = require('../constants.json')
const Discord = require('discord.js')
const utl = require('../utility')

/**
 * Reapply roles on server entry
 * @param {Discord.GuildMember} member 
 */
module.exports.reapplyRoles = (member) => {
    utl.db.createClient(process.env.MURL).then(async db => {
        const userData = await db.get(member.guild.id, member.id)
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
}

/**
 * Checks if member has role or one above it in hierarchy
 * @param {Discord.GuildMember} member 
 * @param {Discord.Role} role 
 */
module.exports.privilage = (member, role) => {
    if(member.roles.cache.find(r => r.position >= role.position))
        return true
    else
        return false
}