const Discord = require('discord.js')
const utl = require('../utility')
const redis = require('redis')
const constants = require('../constants.json')
const { pillar, mute } = require('../constants.json').emojies
const sMsg = 'Снятие мута'

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .unmute <member>
     */
    (args, msg, client) => {
        var moderatorRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= moderatorRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Вы не указали пользователя для мута!')
                return
            }

            // Get and prematurely delete the shadow key
            const rClient = redis.createClient(process.env.RURL)
            rClient.get('muted-' + mMember.user.id, (err, res) => {
                if(err) console.log(err)
                if(res) {
                    // Delete the shadow key
                    rClient.DEL('muted-' + mMember.user.id, err => {
                        if(err) {
                            console.error(err)
                            return
                        }
                    })

                    // Shadow key means that userData exists
                    rClient.get(mMember.user.id, (err, res) => {
                        if(err)
                            console.error(err)

                        mMember.roles.remove(constants.roles.muted)
                        var userData = JSON.parse(res)
                        if(userData.mute) delete userData.mute
                        rClient.set(mMember.user.id, JSON.stringify(userData), err => { if(err) console.log(err) })
                        rClient.quit()

                        utl.embed(msg, sMsg, `${pillar}${mute}${pillar} <@${mMember.user.id}> был(-а) размьючен(-а)`)
                    })
                } else {
                    utl.embed(msg, sMsg, 'Пользователь не был замьючен в первую очередь!')
                }
            })
        } else {
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true