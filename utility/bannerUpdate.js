const { Guild } = require('discord.js')
const { scheduleJob } = require('node-schedule')

/**
 * Updated the banner every hour
 *
 * @param {Guild} guild
 */
const updateBanner = async guild => {
    // Setup
    const { createCanvas, loadImage, registerFont } = require('canvas')
    const path = require('path')
    registerFont(path.resolve(path.join('./', 'fonts', 'japan.otf')), { family: 'Japan' })
    const img = await loadImage(path.resolve(path.join('./', 'imgs', 'banner.png')))

    // Main context
    const primeCanvas = createCanvas(img.width, img.height)
    primeCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height)

    // Member counter contex
    const memberFont = 'bold 165px "Japan"'

    const membersCanvas = createCanvas(img.width, img.height)
    const mcCtx = membersCanvas.getContext('2d')

    let members = 0
    guild.channels.cache.filter(c => c.type == 'voice')
        .forEach(c => {
            members += c.members.size
        })

    const memberText = members.toString()
    let args = [memberText, 0, 0]

    mcCtx.font = memberFont
    mcCtx.textAlign = 'left'

    mcCtx.translate(img.width / 1.39, img.height / 1.4)
    mcCtx.strokeStyle = 'black'
    mcCtx.lineWidth = 3
    mcCtx.strokeText(...args)

    mcCtx.fillStyle = '#8b0000'
    mcCtx.fillText(...args)

    primeCanvas.getContext('2d').drawImage(membersCanvas, 0, 0, img.width, img.height)

    // Time context
    const timeFont = 'bold 130px "Japan"'
    const timeCanvas = createCanvas(img.width, img.height)
    const tcCtx = timeCanvas.getContext('2d')
    tcCtx.font = timeFont
    tcCtx.textAlign = 'left'

    const time = new Date(Date.now()).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }).slice(12, 17)
    args = [time, 0, 0]

    tcCtx.translate(img.width / 1.39, img.height / 1.09)
    tcCtx.strokeStyle = 'black'
    tcCtx.lineWidth = 1
    tcCtx.strokeText(...args)

    tcCtx.fillStyle = '#8b0000'
    tcCtx.fillText(...args)

    primeCanvas.getContext('2d').drawImage(timeCanvas, 0, 0, img.width, img.height)

    // Updating the banner
    // writeFileSync('test.png', primeCanvas.toBuffer())
    guild.setBanner(primeCanvas.toBuffer())
    // .then(() => console.log('set banner'))
}

/**
 * Updated the banner every hour
 *
 * @param {Guild} guild 
 */
module.exports = (guild) => {
    updateBanner(guild)
    scheduleJob('* * * * *', () => {
        updateBanner(guild)
    })
}