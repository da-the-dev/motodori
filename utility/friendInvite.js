const Discord = require('discord.js')
const utl = require('../utility')
const { DBUser } = utl.db
const constants = require('../constants.json')

/**
 * @param {Discord.Client} client
 * @param {Discord.Guild} guild 
 */
module.exports.fetchInvites = async (client, guild) => {
    client.invites = await guild.fetchInvites()
}

/**
 * 
 * @param {Discord.GuildMember} member 
 */
module.exports.invite = async member => {
    const freshInvites = await member.guild.fetchInvites()

    const invite = freshInvites.find(i => member.client.invites.get(i.code).uses < i.uses);
    member.client.invites = freshInvites

    const inviter = await new DBUser(member.guild.id, invite.inviter.id)
    inviter.invites += 1

    if(inviter.invites % 4 == 0)
        inviter.discount += 1

    inviter.save()
}