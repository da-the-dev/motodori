const Discord = require('discord.js')
const { db, embed } = require('../../utility')
const { DBUser } = db
const constants = require('../../constants.json')
const sMsg = 'Развод'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .divorce
     */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.member.id)
        if(!user.mate) {
            embed(msg, sMsg, 'У Вас нет пары!')
            return
        }

        const user2 = await new DBUser(msg.guild.id, user.mate)

        msg.member.roles.remove(constants.roles.loveroom)
        msg.guild.member(user.mate).roles.remove(constants.roles.loveroom)

        delete user.mate
        delete user2.mate

        if(user.loveroom) {
            msg.guild.channels.cache.get(user.loveroom.id).delete()
            delete user.loveroom
            delete user2.loveroom
        }

        await Promise.all([
            user.save(),
            user2.save(),
        ])
    }
