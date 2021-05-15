const Discord = require('discord.js')
const utl = require('../utility')
const { sweet } = require('../constants.json').emojies

/**
 * Gets balance of the member
 * @param {Discord.GuildMember} member
 */
const getBal = async (member) => {
    var user = await new utl.db.DBUser(member.guild.id, member.id)
    user.close()

    if(!user.money)
        return 0
    else
        return user.money

}

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .bal
    */
    async (args, msg, client) => {
        var mMember = msg.mentions.members.first()
        if(!mMember)
            utl.embed(msg, 'Баланс', `У тебя на балансе **${await getBal(msg.member)}** ${sweet}`)
        else
            utl.embed(msg, 'Баланс', `У <@${mMember.id}> на балансе **${await getBal(mMember)}** ${sweet}`)
    }
