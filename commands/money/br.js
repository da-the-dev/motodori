const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser } = utl.db
const { sweet } = require('../../constants.json').emojies
const sMsg = 'Казино'

/**
 * @param {DBUser} user 
 * @returns
 */
const checkIfNan = (user) => {
    if(Number.isNaN(user.money)) {
        utl.embed(msg, sMsg, 'Произошла ошибка! Попробуйте еще раз')
        return true
    }
}

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .br <bet>
    */
    async (args, msg, client) => {
        var bet = args[1]

        if(!bet || !Number.isInteger(amount)) {
            utl.embed.ping(msg, sMsg, 'не указана ставка!')
            return
        }
        if(bet < 50) {
            utl.embed.ping(msg, sMsg, `ставка должна быть больше **50**<${sweet}>`)
            return
        }

        const user = await new DBUser(msg.guild.id, msg.author.id)
        if(!user.money) {
            utl.embed.ping(msg, sMsg, `у Вас нет денег чтобы играть!`)
            return
        }
        if(user.money < bet) {
            utl.embed.ping(msg, sMsg, 'ставка больше Вашего баланса!')
            return
        }

        if(Math.random() < 0.3) {
            user.money += bet * 2
            if(checkIfNan(user)) return
            utl.embed.ping(msg, sMsg, `**Вы выиграли!** Ваш баланс: **${user.money}** ${sweet}`)
        }
        else {
            user.money -= bet
            if(checkIfNan(user)) return
            utl.embed.ping(msg, sMsg, `**Вы проиграли!** Ваш баланс: **${user.money}** ${sweet}`)
        }

        user.save()
    }