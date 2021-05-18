const Discord = require('discord.js')
const utl = require('../utility')
const { DBUser, Connection, getConnection } = utl.db
const redis = require('redis')
const constants = require('../constants.json')
const sMsg = 'Снятие мута'

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .unmute <member>
     */
    (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Вы не указали пользователя для мута!')
                return
            }

            // Get and prematurely delete the shadow key
            const rClient = redis.createClient(process.env.RURL)
            rClient.get('muted-' + mMember.user.id, async (err, res) => {
                if(err) console.log(err)
                if(res) {
                    // Delete the shadow key
                    rClient.DEL('muted-' + mMember.user.id, err => {
                        if(err) {
                            console.error(err)
                            return
                        }
                    })

                    const user = await new DBUser(msg.guild.id, mMember.id, getConnection())
                    user.mute = false
                    await user.save()

                    utl.embed(msg, sMsg, `<@${mMember.user.id}> был(-а) размьючен(-а)`)
                } else {
                    utl.embed(msg, sMsg, 'Пользователь не был замьючен в первую очередь!')
                }
            })
        } else {
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true