const { Message, Client } = require('discord.js')
const { db, embed, redisConnection, actionLogs } = require('../../utility')
const { DBUser } = db
const { getRedCon } = redisConnection
const constants = require('../../constants.json')
const sMsg = 'Выдача мута'

/**
 * New mute command
 * @param {string[]} args 
 * @param {Message} msg 
 * @param {Client} client 
 * Usage: .mute <member> 5s 10s 5m reason
 */
module.exports = async (args, msg, client) => {
    try {
        const mMember = msg.mentions.members.first()
        if(!mMember) throw 'no member'
        args.shift()
        args.shift()

        const regex = /\d+s|\d+m|\d+h|\d+d/

        var time = 0
        const timeArgs = args.filter(e => regex.test(e))
        const reason = args.filter(e => !regex.test(e)).join(' ')
        timeArgs.forEach(e => {
            if(/\d+s/g.test(e))
                time += Number(e.slice(0, -1))
            else if(/\d+m/g.test(e))
                time += Number(e.slice(0, -1)) * 60
            if(/\d+h/g.test(e))
                time += Number(e.slice(0, -1)) * 60 * 60
            if(/\d+d/g.test(e))
                time += Number(e.slice(0, -1)) * 60 * 60 * 24
        })

        if(time <= 0) throw 'invalid time'
        if(!reason) throw 'invalid reason'

        await getRedCon().set(`mute-${mMember.id}`, '')
        getRedCon().expire(`mute-${mMember.id}`, time)

        const user = await new DBUser(mMember.guild.id, mMember.id)
        user.mute = true
        user.save()

        mMember.roles.add(constants.roles.muted)

        const duration = require('moment').duration(time, 'seconds');
        const mmD = duration.days()
        const mmH = duration.hours()
        const mmM = duration.minutes()
        const mmS = duration.seconds()

        var muteMsg = ''

        if(mmD) muteMsg += `**${mmD.toString()}**д `
        if(mmH) muteMsg += `**${mmH.toString()}**ч `
        if(mmM) muteMsg += `**${mmM.toString()}**м `
        if(mmS) muteMsg += `**${mmS.toString()}**с `

        muteMsg = muteMsg.trim()

        embed(msg, sMsg, `<@${mMember.user.id}> получил(-а) **мут** на ${muteMsg} \n\`\`\`Elm\nПричина: ${reason}\n\`\`\``)
        actionLogs.modLog(client.guild, 'mute', msg.member, mMember, msg.createdTimestamp, reason, time)
    } catch(err) {
        switch(err) {
            case 'no member':
                embed.ping(msg, sMsg, `не указан участник!`)
                break
            case 'invalid time':
                embed.ping(msg, sMsg, `неверно указано время!`)
                break
            case 'invalid reason':
                embed.ping(msg, sMsg, `неверно указана причина!`)
                break
        }
    }
}