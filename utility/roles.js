const constants = require('../constants.json')
const Discord = require('discord.js')
const utl = require('../utility')
const { getConnection, DBUser } = utl.db

/**
 * Reapply roles on server entry
 * @param {Discord.GuildMember} member 
 */
module.exports.reapplyRoles = async (member) => {
    console.log(member.guild.id, member.id)
    const user = await new DBUser(member.guild.id, member.id, getConnection())

    if(user) {
        var collectedRoles = []
        // Reapply roles
        if(user.mute)
            collectedRoles.push(constants.roles.muted)
        if(user.toxic)
            collectedRoles.push(constants.roles.toxic)
        if(user.ban)
            collectedRoles.push(constants.roles.localban)
        if(user.pic)
            collectedRoles.push(constants.roles.pics)

        member.roles.add(collectedRoles).then(() => {
            console.log(member.displayName, 'applied roles:', collectedRoles != [] ? collectedRoles : 'none')
        })
    }
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