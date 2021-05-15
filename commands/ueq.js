const Discord = require('discord.js')
const utl = require('../utility')
const sMsg = 'Снятие роли'

/**
 * Unequips a role
 * @param {Discord.GuildMember} member - Member who wants to equip a role
 * @param {number} index - Index of the role
 * @param {boolean} isCustom - If the role is custom
 * @param {Discord.Message} msg - Original message
 */
const equipRole = (member, index, isCustom, msg) => {
    utl.db.createClient(process.env.MURL).then(db => {
        db.get(member.guild.id, member.id).then(userData => {
            if(userData) {
                if((!userData.inv || userData.inv.length <= 0) && (!userData.customInv || userData.customInv <= 0)) {
                    utl.embed.ping(msg, sMsg, 'к сожалению, Ваш инвентарь пуст')
                    db.close()
                    return
                }

                var field = isCustom ? 'customInv' : 'inv'

                if(!userData[field][index - 1]) {
                    utl.embed.ping(msg, sMsg, 'у Вас нет такой роли!')
                    db.close()
                    return
                }

                member.roles.remove(userData[field][index - 1])
                    .then(() => {
                        utl.embed.ping(msg, sMsg, `роль <@&${userData[field][index - 1]}> успешно снята`)
                        db.close()
                    })
            } else {
                utl.embed.ping(msg, sMsg, 'к сожалению, Ваш инвентарь пуст')
                db.close()
            }
        })
    })
}
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .unequip <rolePos>
    */
    (args, msg, client) => {
        if(!args[1]) {
            utl.embed(msg, sMsg, 'Не указан индекс роли!!')
            return
        }
        if(!args[1].startsWith('c'))
            equipRole(msg.member, Number(args[1]), false, msg)
        else
            equipRole(msg.member, Number(args[1].slice(1)), true, msg)
    }

