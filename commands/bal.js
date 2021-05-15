const Discord = require('discord.js')
const utl = require('../utility')
const { sweet } = require('../constants.json').emojies

/**
 * Gets balance of the member
 * @param {Discord.GuildMember} member
 */
const getBal = async (member) => {
    var db = await utl.db.createClient(process.env.MURL)
    var userData = await db.get(member.guild.id, member.id)
    db.close()
    if(userData)
        if(!userData.money)
            return 0
        else
            return userData.money
    else
        return 0
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
        if(!mMember) {
            getBal(msg.member).then(bal => {
                utl.embed(msg, 'Баланс', `У тебя на балансе **${bal}** ${sweet}`)
            })
        } else {
            getBal(mMember).then(bal => {
                utl.embed(msg, 'Баланс', `У <@${mMember.id}> на балансе **${bal}** ${sweet}`)
            })
        }
    }
