const { Message, Client } = require('discord.js')
const { embed, db } = require('../../utility')
const { DBUser } = db
const constants = require('../../constants.json')
const sMsg = 'Активность'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .uact
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)
        user.uact = !user.uact
        user.save()
        if(user.uact)
            msg.member.roles.remove(constants.roles.active)

        embed.ping(msg, sMsg, `роль за активность была ${user.uact ? '**выключена**' : '**включена**'}!`)
    }