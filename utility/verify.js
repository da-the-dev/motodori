const Discord = require('discord.js')
const constants = require('../constants.json')
const { dot } = constants.emojies
const utl = require('../utility')
var reward = false
var currentTimeout = null

/**
 * Verify a user
 * @param {Discord.Message} msg
 * @param {Discord.Client} client 
 */
module.exports = (msg, client) => {
    if(msg.channel.type == 'dm') {
        utl.db.createClient(process.env.MURL).then(async db => {
            const captchaData = await db.get('718537792195657798', `verify-${msg.author.id}`)
            if(captchaData) {
                if(msg.content == captchaData.captcha) {
                    takeRole(client, msg.author.id)
                    db.delete('718537792195657798', `verify-${msg.author.id}`)
                    msg.channel.messages.fetch()
                        .then(msgs => {
                            msgs.forEach(m => {
                                if(m.author.id == client.user.id)
                                    m.delete()
                            })
                        })
                }
                else {
                    await msg.channel.send(new Discord.MessageEmbed().setDescription(`${dot}*Неверно введена капча, генерирую новую** . . . `).setColor('#2F3136'))
                    const captcha = await formCaptcha()
                    utl.db.createClient(process.env.MURL).then(async db => {
                        await db.set('718537792195657798', `verify-${msg.author.id}`, { captcha: captcha.text })
                        db.close()
                        msg.channel.send(captcha.obj)
                    })
                }
            } else
                db.close()
        })
    }
}

/**
 * Take the verification role and apply any roles that should be applied
 * @param {Discord.Client} client 
 * @param {string} id
 */
const takeRole = (client, id) => {
    const member = client.guilds.cache.first().member(id)

    member.roles.remove(constants.roles.verify)
    member.roles.add(constants.roles.man)
    console.log(`[VR] Verified user '${member.user.tag}'`)

    utl.roles.reapplyRoles(member)

    reward = true

    const emb = new Discord.MessageEmbed()
        .setTitle(`${dot}Тепло приветствуем`)
        .setDescription(`Надеемся, что тебе понравится у нас и ты останешься.\nЧтобы легче было ориентироваться, прочитай <#810202155079696414>`)
        .setColor('#2F3136')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))

    client.guilds.cache.first().channels.cache.get(constants.channels.general).send(`<@${member.user.id}>`, { embed: emb })
        .then(m => {
            currentTimeout ? clearTimeout(currentTimeout) : null
            setTimeout(() => {
                reward = false
                !m.deleted ? m.delete() : null
            }, 60000, m)
        })
}

/**
 * Captcha type
 * @typedef captcha
 * @property {string} text - Text of captcha
 * @property {Object} obj - Object containing info for the message
 */

/**
 * Return an array with text and message object with CAPTCHA
 * @returns {Promise<captcha>}
 */
const formCaptcha = () => {
    return new Promise(async (resolve, reject) => {
        const { createCanvas, loadImage } = require('canvas')
        const path = require('path')
        const canvas = createCanvas(1920, 1080)
        const ctx = canvas.getContext('2d')

        const img = await loadImage(path.resolve(path.join('./', 'imgs', 'captcha.png')))
        ctx.drawImage(img, 0, 0, img.width, img.height)

        function makeid(length) {
            var result = '';
            var characters = '0123456789';
            var charactersLength = characters.length;
            for(var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        const text = makeid(4)
        const font = 'bold 150px "Sans"'
        const args = [text, img.width / 5 + 10, img.height / 2]

        ctx.fillStyle = '#e5b6de'
        ctx.font = font
        ctx.textAlign = 'center'
        ctx.fillText(...args)

        ctx.fillStyle = 'black'
        ctx.font = font
        ctx.textAlign = 'center'
        ctx.lineWidth = 2
        ctx.strokeText(...args)

        resolve({
            text: text,
            obj: { content: '<a:__:825834909146415135> **Напишите указанный код на картинке**', files: [canvas.toBuffer()] }
        })
    })
}

/**
 * Leaves reaction on users' welcome messages
 * @param {Discord.Message} msg - Message to react to
 * @param {Discord.Client} client - Client to check for perms to react
 */
const welcomeWords = ['добр', 'прив', 'хай', 'welcome', 'hi', 'салам', 'здрав', 'hello']
module.exports.welcomeReward = (msg, client) => {
    if(reward) {
        var c = msg.content.toLocaleLowerCase()
        if(welcomeWords.find(w => c.includes(w)))
            msg.react('<:__:824359401895886908>')
    }
}

/**
 * Marks new users for verification
 * @param {Discord.GuildMember} member
 */
module.exports.mark = async (member) => {
    await member.roles.add(constants.roles.verify)
    console.log(`[VR] Marked user '${member.user.username}'`)
    const captcha = await formCaptcha()
    utl.db.createClient(process.env.MURL).then(async db => {
        await db.set('718537792195657798', `verify-${member.id}`, { captcha: captcha.text })
        db.close()
        member.send(captcha.obj)
    })
}