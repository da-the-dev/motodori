const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser, getConnection } = utl.db
const sMsg = 'Экипировка роли'

/**
 * Equips a role
 * @param {Discord.GuildMember} member - Member who wants to equip a role
 * @param {number} index - Index of the role
 * @param {boolean} isCustom - If the role is custom
 * @param {Discord.Message} msg - Original message
 */
const equipRole = async (member, index, isCustom, msg) => {
    const user = await new DBUser(member.guild.id, member.id, getConnection())

    if(!user.inv && !user.customInv) {
        utl.embed.ping(msg, sMsg, 'к сожалению, Ваш инвентарь пуст')
        return
    }

    var field = isCustom ? 'customInv' : 'inv'
    if(!user[field] || !user[field][index - 1]) {
        utl.embed.ping(msg, sMsg, 'у Вас нет такой роли!')

        return
    }

    member.roles.add(user[field][index - 1])
        .then(() => {
            utl.embed.ping(msg, sMsg, `роль <@&${user[field][index - 1]}> успешно надета`)

        })
}
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .equip <rolePos>
    */
    (args, msg, client) => {
        if(!args[1]) {
            utl.embed.ping(msg, sMsg, 'не указан индекс роли!')
            return
        }

        if(!Number.isInteger(Number(args[1])) && (Array.from(args[1]).filter(s => s == 'c').length != 1 && args[1][0] != 'c')) {
            utl.embed.ping(msg, sMsg, 'указан неверный индекс роли!')
            return
        }

        if(args[1].startsWith('c'))
            equipRole(msg.member, Number(args[1].slice(1)), true, msg)
        else
            equipRole(msg.member, Number(args[1]), false, msg)
    }