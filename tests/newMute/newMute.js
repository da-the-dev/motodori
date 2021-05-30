const { Message, Client } = require('discord.js')
const { db, embed, redisConnection } = require('../../utility')
const { DBUser } = db
const { getRedCon } = redisConnection
const moment = require('moment')


/** 
 * Input: .mute member 5s 10s 5m some reason
 * @param {string[]} args
 */
module.exports.parser = (args) => {
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

    return {
        time: time,
        reason: reason
    }
}

/**
 * Adds a shadow key for .mute
 * @param {string} id 
 * @param {number} time in seconds
 */
module.exports.saveToRedis = async (id, time) => {
    await getRedCon().set(`mute-${id}`, '')
    await getRedCon().expire(`mute-${id}`, time)
}

/**
 * Adds mute flag in MongoDB
 * @param {string} id 
 * @param {string} guildIDы
 * @param {boolean} value
 */
module.exports.saveToMongo = async (id, guildID, value) => {
    const user = await new DBUser(guildID, id)
    user.mute = true
    await user.save()
}

/**
 * Calculates time from seconds into s,m,h,d
 * @param {number} time 
 */
module.exports.timeCalculator = (time) => {
    const duration = moment.duration(time, 'seconds');

    const mmD = duration.days()
    const mmH = duration.hours()
    const mmM = duration.minutes()
    const mmS = duration.seconds()

    var msg = ''

    if(mmD) msg += `**${mmD.toString()}**д `
    if(mmH) msg += `**${mmH.toString()}**ч `
    if(mmM) msg += `**${mmM.toString()}**м `
    if(mmS) msg += `**${mmS.toString()}**с `

    return msg.trim()
}