const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
const { dot } = require('../constants.json').emojies
var reward = false
var currentTimeout = null
/**
 * 
 * @param {Discord.Message} msg
 * @param {Discord.Client} client 
 */
module.exports = async (msg, client) => {
    if(msg.channel.type == 'dm') {
        utl.db.createClient(process.env.MURL).then(db => {
            db.get('718537792195657798', 'verify-' + msg.author.id)
                .then(captchaData => {
                    if(captchaData) {
                        if(msg.content == captchaData.captcha) {
                            takeRole(client, msg.author.id)
                            db.delete('718537792195657798', 'verify-' + msg.author.id).then(() => { console.log(`deleted verify-${msg.author.id}`); db.close() })
                            msg.channel.messages.fetch()
                                .then(msgs => {
                                    msgs.forEach(m => {
                                        if(m.author.id == client.user.id)
                                            m.delete()
                                    })
                                })
                        }
                        else {
                            msg.channel.send(new Discord.MessageEmbed().setDescription('<:__:827599506928959519> **Неверно введена капча, генерирую новую** . . . ').setColor('#2F3136'))
                            formCaptcha().then(captcha => {
                                utl.db.createClient(process.env.MURL).then(async db => {
                                    await db.delete('718537792195657798', 'verify-' + msg.author.id)
                                    await db.set('718537792195657798', 'verify-' + msg.author.id, { captcha: captcha.text })
                                    db.close()
                                    msg.channel.send(captcha.obj)
                                })
                            })
                        }
                    } else {
                        db.close()
                    }
                })
        })
    }
}

/**
 * 
 * @param {Discord.Client} client 
 */
const takeRole = async (client, id) => {
    var member = await client.guilds.cache.first().members.fetch(id)
    console.log(member.user.username)
    await member.roles.remove(client.verify)
        .catch(err => console.log(err))

    console.log(`[VR] Verified user '${member.user.tag}'`)
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
                m.delete()
                    .catch(e => { })
            }, 60000, m)
        })
}


/**
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

        const { createCanvas, loadImage, registerFont } = require('canvas')
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
module.exports.mark = async (member, client) => {
    member.roles.add(constants.roles.verify).then(() => {
        console.log(`[VR] Marked user '${member.user.username}'`)
        formCaptcha().then(captcha => {
            utl.db.createClient(process.env.MURL).then(db => {
                db.set('718537792195657798', 'verify-' + member.id, { captcha: captcha.text }).then(() => {
                    db.close(); member.send(captcha.obj)
                })
            })
        })
    })
}