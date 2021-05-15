const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const { sweet } = require('../constants.json').emojies
const sMsg = 'Создание кастомной роли'


/** Role cost */
const cost = 7000
/**
 * Retrieves HEX color name 
 * @param {string} hex - HEX string
 * @returns {Promise<string>} HEX name
 */
const fetchHEXName = (hex) => {
    return new Promise((resolve, reject) => {
        const fetch = require('node-fetch');
        fetch(`https://www.thecolorapi.com/id?hex=${hex.slice(1)}`)
            .then(res => {
                res.text()
                    .then(res => {
                        resolve(JSON.parse(res).name.value)
                    })
                    .catch(err => reject(err))
            })
            .catch(err => reject(err))
    })
}

/**
 * Create a custom role
 * @param {Discord.Message} msg - OG message
 * @param {string} name - Role's name
 * @param {string} hex - Role's hex color
 * @param {Function} success - Success function tp run at the end
 */
const createRole = (msg, name, hex, success, db) => {
    msg.guild.roles.cache.get('810460637317955584').position
    msg.guild.roles.create({
        data: {
            name: name,
            color: hex,
            position: msg.guild.roles.cache.get(constants.roles.endOfCRoles).position + 1
        },
        reason: `${msg.author.tag} создал(-а) эту роль командой .createRole`
    }).then(r => {
        utl.db.createClient(process.env.MURL).then(async db => {
            // Set expireDate to 00:00:00:0000 of the next month
            var expireDate = new Date(Date.now())
            if(expireDate.getMonth() != 12)
                expireDate.setMonth(expireDate.getMonth() + 1)
            else {
                expireDate.setMonth(1)
                expireDate.setFullYear(expireDate.getFullYear() + 1)
            }
            expireDate.setHours(0)
            expireDate.setMinutes(0)
            expireDate.setSeconds(0)
            expireDate.setMilliseconds(0)

            // Update serverSettings to include a new custom role
            await db.update(msg.guild.id, 'serverSettings', {
                $push: {
                    customRoles: {
                        id: r.id,
                        owner: msg.author.id,
                        createdTimestamp: Date.now(),
                        expireTimestamp: expireDate.getTime(),
                        members: 1
                    }
                }
            })
            // Add the role to custom invetory
            await db.update(msg.guild.id, msg.author.id, { $push: { customInv: r.id } })
            await success(db)
            utl.embed.ping(msg, sMsg, `Вы успешно создали роль <@&${r.id}>`)
        })
    })
}

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .rcr <hex> <name>
    */
    async (args, msg, client) => {
        var hex = args[1]
        if(!hex) {
            utl.embed(msg, sMsg, 'Не указан цвет роли!')
            return
        }
        if(!hex.startsWith('#')) {
            utl.embed(msg, sMsg, 'Цвет роли должен быть в формате **HEX** и начинаться с `#`!')
            return
        }
        if(hex.length != 7) {
            utl.embed(msg, sMsg, 'Цвет роли должен быть в формате **HEX** и состоять в общей сложности из **7** символов!\n```#FFFFFF - Белый\n#000000 - Черный```')
            return
        }
        hex = hex.toUpperCase()

        args.shift()
        args.shift()

        var name = args.join(' ')
        if(!name) {
            utl.embed(msg, sMsg, 'Не указано название роли!')
            return
        }


        utl.db.createClient(process.env.MURL).then(db => {
            db.get(msg.guild.id, 'serverSettings').then(serverData => {
                var counter = 0
                serverData.customRoles.forEach(r => {
                    r.owner == msg.author.id ? counter++ : null
                })

                if(counter >= 2) {
                    utl.embed(msg, sMsg, 'У Вас уже есть 2 кастомные роли!')
                    db.close()
                    return
                }

                db.get(msg.guild.id, msg.author.id).then(async userData => {
                    if(userData) {
                        if(!userData.money || (userData.money && userData.money < cost)) {
                            utl.embed(msg, sMsg, 'У Вас не хватает конфет!')
                            db.close()
                            return
                        }

                        // Paying with money, no boosts
                        utl.embed(msg, sMsg, `Подтверждаете создание роли c цветом **${await fetchHEXName(hex)}** и названем **${name}**?\nСтоимость роли на **30** дней — **${cost}** ${sweet}`).then(m => {
                            utl.reactionSelector.yesNo(m, msg.author.id,
                                () => {
                                    createRole(msg, name, hex, (db) => {
                                        db.update(msg.guild.id, msg.author.id, { $inc: { money: -cost } })
                                    }, db)
                                    m.delete()
                                    db.close()
                                },
                                () => {
                                    m.delete()
                                    db.close()
                                },
                                () => {
                                    m.delete()
                                    db.close()
                                }
                            )
                        })
                    }
                    else {
                        utl.embed(msg, sMsg, 'У Вас нет конфет!')
                        db.close()
                    }
                })
            })
        })
    }