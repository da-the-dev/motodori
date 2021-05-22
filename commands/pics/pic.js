const Discord = require('discord.js')
const constants = require('../../constants.json')
const { sweet } = constants.emojies
const utl = require('../../utility')
const { DBUser } = utl.db
const price = 5000
const sMsg = 'Картинки'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .pic
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)
        if(!user.money || user.money < price) {
            utl.embed.ping(msg, sMsg, `у Вас недостаточно ${sweet}! *(нужно ${price}${sweet})*`)
            return
        }
        if(user.pics) {
            utl.embed.ping(msg, sMsg, `роль <@&${constants.roles.pics}> уже у Вас есть!`)
            return
        }

        utl.embed.ping(msg, sMsg, `Вы подтверждаете покупку спец-роли <@&${constants.roles.pics}> за ${price}${sweet}?`).then(m => {
            utl.reactionSelector.yesNo(m, msg.author.id,
                () => {
                    user.money -= 5000
                    user.pics = true
                    user.save()
                    msg.member.roles.add(constants.roles.pics)
                    m.edit(utl.embed.build(msg, sMsg, `${msg.author}, Вы успешно купили роль <@&${constants.roles.pics}>`))
                    m.reactions.removeAll()
                },
                () => {
                    m.delete()
                },
                () => {
                    m.delete()
                }
            )
        })


    }