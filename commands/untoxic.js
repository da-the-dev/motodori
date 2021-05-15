const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
const sMsg = 'Прочие роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .toxic <member>
    */
    (args, msg, client) => {
        var chatCRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= chatCRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Не указан участник!')
                return
            }

            utl.db.createClient(process.env.MURL).then(db => {
                db.get(msg.guild.id, mMember.user.id).then(userData => {
                    if(userData) {
                        if(userData.toxic) {
                            delete userData.toxic
                            db.set(msg.guild.id, mMember.user.id, userData).then(() => db.close())
                            mMember.roles.remove(constants.roles.toxic).then(() => {
                                utl.embed(msg, sMsg, `У пользователя <@${mMember.user.id}> была убрана роль <@&${constants.roles.toxic}>`)
                            })
                        }
                    } else {
                        utl.embed(msg, sMsg, `У пользователя <@${mMember.user.id}> изначально не было роли <@&${constants.roles.toxic}>`)
                        db.close()
                    }
                })
            })
        } else
            utl.embed(msg, sMsg, 'У Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true