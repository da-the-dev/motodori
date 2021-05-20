const Discord = require('discord.js')
const utl = require(require('path').resolve('utility.js'))
const { DBUser, getConnection } = utl.db
const constants = require(require('path').resolve('constants.json'))
const sMsg = 'Передача валюты'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .transfer <member> <ammount>
    */
    async (args, msg, client) => {
        var mMember = msg.mentions.members.first()
        if(!mMember) {
            utl.embed(msg, sMsg, 'Не указан участник!')
            return
        }
        if(!args[2]) {
            utl.embed(msg, sMsg, 'Не указана сумма!')
            return
        }
        var amount = Number(args[2])
        if(!amount || !Number.isInteger(amount)) {
            utl.embed(msg, sMsg, 'Указана неверная сумма!')
            return
        }

        if(msg.author.id == mMember.user.id) {
            utl.embed(msg, sMsg, 'Нельзя переводить деньги самому себе!')
            return
        }

        if(amount <= 0) {
            utl.embed(msg, sMsg, 'Неверная сумма!')
            return
        }

        const user = await new DBUser(msg.guild.id, mMember.id, getConnection())

        if(amount > user.money) { // If too much money is requested 
            utl.embed(msg, sMsg, 'У тебя недостаточно средств для перевода!')
        } else {
            await user.save()
            utl.embed(msg, sMsg, `Вы передали пользователю <@${mMember.user.id}> **${amount}** ${constants.emojies.sweet}`)
        }
    }