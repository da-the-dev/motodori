const Discord = require('discord.js')
const utl = require('../utility')
const { DBServer, DBUser } = utl.db
const constants = require('../constants.json')
const sMsg = 'Разрыв отношений'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .divorce
    */
    async (args, msg, client) => {
        var user = await new DBUser(msg.guild.id, msg.author.id)
        if(!user.loveroom) {
            utl.embed.ping(msg, sMsg, 'у Вас нет пары!')
            db.close()
            return
        }

        const c = msg.guild.channels.cache.get(user.loveroom.id)
        c ? c.delete() : null
        const partnerID = user.loveroom.partner

        delete user.loveroom
        user.save()

        msg.member.roles.remove(constants.roles.loveroom)
        msg.guild.members.cache.get(partnerID).roles.remove(constants.roles.loveroom)

        var partner = await new DBUser(msg.guild.ownerID, partnerID)
        delete partner.loveroom
        partner.save()

        utl.embed(msg, sMsg, `<@${msg.member.id}> и <@${partnerID}> больше не пара :(`)
    }