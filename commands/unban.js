const Discord = require('discord.js')
const constants = require('../constants.json')
const { pillar, ban } = require('../constants.json').emojies
const utl = require('../utility')
const sMsg = 'Снятие локальной блокировки'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .unban <member>
    */
    (args, msg, client) => {
        var curatorRole = msg.guild.roles.cache.get(constants.roles.curator)
        if(msg.member.roles.cache.find(r => r.position >= curatorRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Не указан участник!')
                return
            }

            utl.db.createClient(process.env.MURL).then(db => {
                db.get(msg.guild.id, mMember.user.id)
                    .then(userData => {
                        if(userData) {
                            if(userData.ban) {
                                delete userData.ban
                                db.set(msg.guild.id, mMember.user.id, userData).then(() => db.close())
                                mMember.roles.remove(constants.roles.localban)
                                    .then(() => utl.embed(msg, sMsg, `${pillar}${ban}${pillar} C пользователя <@${mMember.id}> была снята локальная блокировка`))
                            }
                        } else {
                            utl.embed(msg, sMsg, 'Пользователь изначально не был забанен')
                            db.close()
                        }
                    })
            })
        } else
            utl.embed(msg, sMsg, 'У Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true