const constants = require('../constants.json')
const Discord = require('discord.js')
const utl = require('../utility')
const { sweet, dot } = require('../constants.json').emojies
const sMsg = 'Любовная комната'

const timeTillPayday = () => {
    var today = new Date(new Date(Date.now()).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
    var payday = new Date(new Date(Date.now()).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))

    payday.setUTCHours(0)
    payday.setUTCMinutes(0)
    payday.setUTCSeconds(0)
    payday.setUTCMilliseconds(0)

    if(today.getDate() >= 24 && today.getDate() <= 31) {
        if(today.getUTCMonth() == 12) {
            payday.setUTCFullYear(today.getUTCFullYear() + 1)
            payday.setUTCMonth(1)
        }
        else
            payday.setUTCMonth(today.getUTCMonth() + 1)
        payday.setUTCDate(1)
    }
    else if(today.getDate() >= 1 && today.getDate() <= 11)
        payday.setUTCDate(12)
    else if(today.getDate() >= 12 && today.getDate() <= 23)
        payday.setUTCDate(24)

    return `${utl.time.timeCalculator(Math.round((payday.getTime() - today.getTime()) / 1000 / 60))}`
}

/**
 * @param {Array<string>} args Command argument
 * @param {Discord.Message} msg Discord message object
 * @param {Discord.Client} client Discord client object
 * @description Usage: .loveProfile
 */
module.exports = (args, msg, client) => {
    utl.db.createClient(process.env.MURL).then(async db => {
        var userData = await db.get(msg.guild.id, msg.author.id)
        if(userData) {
            if(!userData.loveroom) {
                utl.embed(msg, sMsg, 'у Вас нет пары!')
                db.close()
                return
            }

            var today = new Date(new Date(Date.now()).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
            var payday = new Date(Date.now())
            if(today.getDay() >= 24 && today.getDate() <= 31)
                payday.setDate(1)
            if(today.getDay() >= 1 && today.getDate() <= 11)
                payday.setDate(12)
            if(today.getDay() >= 12 && today.getDate() <= 23)
                payday.setDate(23)

            var date = new Date(userData.loveroom.creationDate)
            var embed = new Discord.MessageEmbed()
                .setTitle(`${dot}Профиль пары`)
                .setDescription(` \`💞\` — **Партнёр:**\n> <@${userData.loveroom.partner}>\n \`📅\` — **Дата регистрации пары:**\n> ${date.toLocaleDateString('ru-RU')}\n \`💳\` — **Баланс пары:**\n> ${userData.loveroom.bal}${sweet}\n \`🕚\` — **До оплаты осталось**\n> ${timeTillPayday()}\n `)
                .setColor('#2F3136')
                .setImage('https://images-ext-1.discordapp.net/external/txw3kAxSQCx2LxUFgsBt-EIZ63PMl05wnsCJnnHVMTE/https/media.discordapp.net/attachments/736038639791767594/743986900179615763/unknown.png')

            msg.channel.send(embed)
            db.close()
        } else {
            utl.embed(msg, sMsg, 'у Вас нет пары!')
            db.close()
        }
    })
}