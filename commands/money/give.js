const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser } = utl.db
const { sweet } = require('../../constants.json').emojies
const sMsg = 'Изменение баланса'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .give <member> <ammount>
     */
    async (args, msg, client) => {
        // Check if admin
        if(msg.member.roles.cache.find(r => r.permissions.has('ADMINISTRATOR'))) {
            const mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Не указан участник!')
                return
            }
            if(!args[2]) {
                utl.embed(msg, sMsg, 'Не указана сумма!')
                return
            }
            const amount = Number(args[2])
            if(!amount || !Number.isInteger(amount)) {
                utl.embed(msg, sMsg, 'Указана неверная сумма!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id)

            user.money ? user.money += amount : user.money = amount
            await user.save()

            utl.embed(msg, sMsg, `Баланс пользователя <@${mMember.user.id}> изменен на **${amount}** ${sweet}`)
        } else
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
    }