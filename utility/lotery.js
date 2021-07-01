const { Guild, Message, MessageAttachment, MessageEmbed } = require('discord.js')
const { embed, db, redisConnection } = require('../utility')
const { getRedCon } = redisConnection
const { getConnection } = db
const constants = require('../constants.json')
const { sweet } = constants.emojies
const { DBUser } = require('./db')
const delay = 7 * 60 * 60

let loteryKeyword = ''

const toRad = angle => {
    return angle * Math.PI / 180
}

/**
 * @param {string} keyword 
 * @returns 
 */
const buildKeyword = async keyword => {
    const { createCanvas, loadImage } = require('canvas')
    const path = require('path')

    // registerFont(path.resolve(path.join('./', 'fonts', 'manga.ttf')), { family: 'Japan' })
    const img = await loadImage(path.resolve(path.join('./', 'imgs', 'lotery.png')))
    const canvas = createCanvas(img.width, img.height)

    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0, img.width, img.height)

    const text = keyword
    let font = 'bold 0px "Sans"'
    const args = [text, 0, 0]

    let cords = []
    let rotation = 0

    const random = Math.floor(Math.random() * 3) + 1
    // const random = 3
    switch(random) {
        case 1:
            font = font.replace('0px', '80px')
            cords = [img.width / 5, img.height / 2 + 100]
            rotation = toRad(0)
            break
        case 2:
            font = font.replace('0px', '50px')
            cords = [img.width / 1.4, img.height / 2 + 80]
            rotation = toRad(25)
            break
        case 3:
            font = font.replace('0px', '50px')
            cords = [img.width / 1.07, img.height / 3]
            rotation = toRad(85)
            break
    }

    ctx.translate(...cords)
    ctx.rotate(rotation)
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.lineWidth = 8
    ctx.strokeStyle = 'black'
    ctx.strokeText(...args)

    ctx.font = font
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.fillText(...args)

    return canvas.toBuffer()
}

module.exports.buildKeyword = buildKeyword

/**
 * Generate lotery itself
 *
 * @param {Guild} guild 
 */
module.exports.generate = async guild => {
    const keyword = Math.random().toString(36).toLocaleLowerCase().substring(2, 7)
    const reward = Math.floor(Math.random() * 1000 - 200) + 200
    await getConnection().set(guild.id, 'loteryData',
        {
            keyword: keyword,
            reward: reward
        })
    await getRedCon().set('lotery', '')
    getRedCon().expire('lotery', delay)
    const attachment = new MessageAttachment(await buildKeyword(keyword), 'keyword.png')
    const emb = new MessageEmbed
        ({
            'title': 'Лотерея!',
            'description': 'Пиши ключевое слово в чат чтобы получить награду!',
            'color': 15406156,
            'fields': [
                {
                    'name': 'Разыгрывается:',
                    'value': `\`\`\`${reward} Yen\`\`\``
                },
                {
                    'name': 'Ключевое слово:',
                    'value': '⠀⠀⠀⠀⠀⠀⠀'
                }
            ]
        })
        .attachFiles(attachment)
        .setImage('attachment://keyword.png')
    guild.channels.cache.get(constants.channels.general).send(emb)
    loteryKeyword = keyword
}

/**
 * Start the lotery softy
 *
 * @param {Guild} guild
 */
module.exports.init = async guild => {
    const lotery = await getRedCon().get('lotery')
    if(lotery == null) {
        this.generate(guild)
    }
}

/**
 * Give the reward if lotery is active and the code is correct
 *
 * @param {Message} msg 
 */
module.exports.reward = async msg => {
    if(loteryKeyword && msg.channel.id == constants.channels.general && msg.content == loteryKeyword) {
        loteryKeyword = ''

        const user = await new DBUser(msg.guild.id, msg.author.id)
        const reward = (await getConnection().get(msg.guild.id, 'loteryData')).reward

        user.money += reward
        user.save()
        embed.ping(msg, 'Победа в лотерее', `Вы выиграли в лотерее и получили ${reward}${sweet}`)
        // generate(msg.guild)
    }
}

