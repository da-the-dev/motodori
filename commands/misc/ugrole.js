const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser } = utl.db
const constants = require('../../constants.json')
const sMsg = 'Игровые роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .ugrole
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)
        user.disGameRole = user.disGameRole
        user.save()
        utl.embed(msg, sMsg, `Вы успешно ${!user.disGameRole ? '**включили**' : '**отключили**'} роли за игровую активность`)
    }