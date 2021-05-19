const Discord = require('discord.js')
const utl = require('../utility')
const { DBUser, getConnection } = utl.db
const redis = require('redis')
const constants = require('../constants.json')
const sMsg = 'Мут'

/**
 * @description Check if there's only one 's', 'm', 'h' is 'life'
 * @param {string} str
 * @param {string} letter
 */
const checkForLetters = (str) => {
    if(str == 'life')
        return str
    if(str.endsWith('s') || str.endsWith('m') || str.endsWith('h') || str.endsWith('d')) {
        var arr = str.split("")
        arr = arr.filter(a => a != '0' && a != '1' && a != '2' && a != '3' && a != '4' && a != '5' && a != '6' && a != '7' && a != '8' && a != '9')
        if(arr.length > 1)
            return false
        return str
    }
    return false
}

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .mute <member> <time> "<reason>"
     * @example .mute @daym bro 5h "reason"
     */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.eventor))) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'Вы не указали пользователя для мута!')
                return
            }

            args.shift()
            args.shift()

            if(args.length == 0) { // If no settings were provided
                utl.embed.ping(msg, sMsg, 'Вы не указали время, на которое замутить человека!')
                return
            }

            var reasonIndex = args.findIndex(r => r.startsWith('-'))
            if(reasonIndex == -1) {
                utl.embed.ping(msg, sMsg, 'Не указана причина мута!')
                return
            }
            var reason = args.slice(reasonIndex, args.length).join(' ')
            reason = reason.slice(1)
            args = args.slice(0, reasonIndex)

            if(!args.every(a => checkForLetters(a))) { // Check if settings are valid
                utl.embed.ping(msg, sMsg, 'Неверный формат времени!')
                return
            }

            await mMember.roles.add(constants.roles.muted) // Actually mute

            var time = 0

            var isLife = args.find(a => a == 'life')

            if(!isLife)
                for(i = 0; i < args.length; i++) {
                    var a = args[i]
                    var sType = a[a.length - 1]
                    var sValue = Number(a.slice(0, a.length - 1))

                    switch(sType) {
                        case 's':
                            time += sValue
                            break
                        case 'm':
                            time += sValue * 60
                            break
                        case 'h':
                            time += sValue * 60 * 60
                            break
                        case 'd':
                            time += sValue * 60 * 60 * 24
                            break
                    }
                }
            else
                time = -1

            if(time == 0) {
                utl.embed.ping(msg, sMsg, 'Неверный формат времени!')
                return
            }


            if(time == -1) {
                utl.embed(msg, sMsg, `Пользователь <@${mMember.user.id}> получил(-а) **мут навсегда** \n\`\`\`Elm\nПричина: ${reason}\n\`\`\``)
            } else {
                var mmD = Math.floor(time / 60 / 60 / 24)
                var mmH = Math.floor(time / 60 / 60) - (mmD * 24)
                var mmM = Math.floor(time / 60) - (mmD * 60 * 24 + mmH * 60)
                var mmS = Math.floor(time - (mmD * 60 * 60 * 24 + mmH * 60 * 60 + mmM * 60))
                var muteMsg = ''

                if(mmD) muteMsg += '**' + mmD.toString() + '**' + "d "
                if(mmH) muteMsg += '**' + mmH.toString() + '**' + "h "
                if(mmM) muteMsg += '**' + mmM.toString() + '**' + "m "
                if(mmS) muteMsg += '**' + mmS.toString() + '**' + "s "

                // console.log(mmD, mmH, mmM, mmS)

                const rClient = redis.createClient(process.env.RURL)
                // Set shadow key
                rClient.set('muted-' + mMember.user.id, true)
                rClient.expire('muted-' + mMember.user.id, time)
                rClient.quit()

                const user = await new DBUser(msg.guild.id, mMember.id, getConnection())
                user.mute = true
                await user.save()

                utl.embed(msg, 'Выдача мута', `<@${mMember.user.id}> получил(-а) **мут** на ${muteMsg} \n\`\`\`Elm\nПричина: ${reason}\n\`\`\``)
                utl.moderatorLog.log(msg, 'mute', msg.member, mMember, msg.createdTimestamp, reason, time)
            }
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет прав для этой команды!')
    }
module.exports.allowedInGeneral = true