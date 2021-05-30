/**
 * 
 * @param {number} time - Time in minutes
 * @returns 
 */
module.exports.timeCalculator = (time) => {
    var mmD = Math.floor(time / 24 / 60)
    var mmH = Math.floor(time / 60) - (mmD * 24)
    var mmM = Math.floor(time) - (mmD * 60 * 24 + mmH * 60)
    var msg = ''

    if(mmD) msg += `**${mmD.toString()}**д `
    if(mmH) msg += `**${mmH.toString()}**ч `
    if(mmM) msg += `**${mmM.toString()}**м `

    return msg
}

/**
 * 
 * @param {number} time - Time in seconds
 * @returns 
 */
module.exports.timeCalculatorSec = (time) => {
    const duration = require('moment').duration(time, 'seconds');

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
/**
 * Converts the timestampt into Moscow date
 * @param {number} timestamp 
 * @returns {Date}
 */
module.exports.convertTime = timestamp => {
    return new Date(new Date(timestamp).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }))
}