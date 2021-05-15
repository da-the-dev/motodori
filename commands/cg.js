const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const sMsg = 'Гендерные роли'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .cg <member>
     */
    async (args, msg, client) => {
        var moderatorRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= moderatorRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'Вы не указали пользователя для обновления роли!')
                return
            }

            var gen = 0

            console.log(mMember.roles.cache.has(constants.roles.man))

            if(mMember.roles.cache.has(constants.roles.man)) {
                mMember.roles.remove(constants.roles.man)
                mMember.roles.add(constants.roles.woman)
            } else {
                mMember.roles.remove(constants.roles.woman)
                mMember.roles.add(constants.roles.man)
                gen = 1
            }

            utl.embed(msg, sMsg, `Гендер пользователя <@${mMember.id}> был изменён на **${gen == 0 ? 'женский' : 'мужской'}** `)

        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет прав для этой команды!')
    }