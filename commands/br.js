const Discord = require('discord.js')
const utl = require('../utility')
const { sweet } = constants.emojies
const sMsg = 'Казино'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .br <bet>
    */
    async (args, msg, client) => {
        var bet = args[1]
        if(!bet) {
            utl.embed.ping(msg, sMsg, 'не указана ставка!')
            return
        }
        if(bet < 50) {
            utl.embed.ping(msg, sMsg, `ставка должна быть больше **50** <${sweet}>`)
            return
        }

        var user = await new utl.db.DBUser(msg.guild.id, msg.author.id)
        if(!user.money) {
            utl.embed.ping(msg, sMsg, `у Вас нет денег чтобы играть!`)
            user.close()
            return
        }
        if(user.money < bet) {
            utl.embed.ping(msg, sMsg, 'ставка больше Вашего баланса!')
            user.close()
            return
        }

        var rand = Math.floor(Math.random() * 99) + 1
        if(rand >= 80) {
            user.money += bet * 2
            utl.embed.ping(msg, sMsg, `Вы выиграли! Ваш баланс: **${user.money}** ${sweet}`)
        }
        else {
            user.money -= bet
            user.money < 0 ? user = 0 : null
            utl.embed.ping(msg, sMsg, `Вы проиграли! Ваш баланс: **${user.money}** ${sweet}`)
        }
        user.save()
    }