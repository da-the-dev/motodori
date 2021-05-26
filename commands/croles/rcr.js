const Discord = require('discord.js')
const utl = require('../../utility')
const { getConnection, DBServer, DBUser } = utl.db
const constants = require('../../constants.json')
const { sweet } = constants.emojies
const sMsg = 'Создание кастомной роли'

/** Role cost */
const cost = 10000
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
const createRole = async (msg, name, hex, price) => {
    const pos = msg.guild.roles.cache.get('842137782364930098').position
    const r = await msg.guild.roles.create({
        data: {
            name: name,
            color: hex,
            position: pos + 1
        },
        reason: `${msg.author.tag} создал(-а) эту роль командой .rcr`
    })
    // Set expireDate to 00:00:00:0000 of the next month
    var expireDate = new Date(Date.now())
    if(expireDate.getMonth() != 12)
        expireDate.setMonth(expireDate.getMonth() + 1)
    else {
        expireDate.setMonth(1)
        expireDate.setFullYear(expireDate.getFullYear() + 1)
    }
    expireDate.setHours(0, 0, 0, 0, 0)

    const DBElements = await Promise.all([
        new DBServer(msg.guild.id),
        new DBUser(msg.guild.id, msg.author.id)
    ])
    const server = DBElements[0]
    const user = DBElements[1]
    server.customRoles.push(
        {
            id: r.id,
            owner: msg.author.id,
            createdTimestamp: Date.now(),
            expireTimestamp: expireDate.getTime(),
            members: 1,
        }
    )
    await server.save()

    console.log(r.id)
    user.customInv.push(r.id)
    user.money -= price
    await user.save()

    utl.embed.ping(msg, sMsg, `Вы успешно создали роль <@&${r.id}>`)
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
            utl.embed.ping(msg, sMsg, 'не указан цвет роли!')
            return
        }
        if(!hex.startsWith('#') || hex.length != 7) {
            utl.embed.ping(msg, sMsg, 'цвет роли должен быть в формате **HEX** и начинаться с `#`!\n```#FFFFFF - Белый\n#000000 - Черный```')
            return
        }

        hex = hex.toUpperCase()
        hex == '#000000' ? hex == '#010101' : null

        args.shift()
        args.shift()

        var name = args.join(' ')
        if(!name) {
            utl.embed.ping(msg, sMsg, 'не указано название роли!')
            return
        }

        const server = await new DBServer(msg.guild.id)
        var counter = 0
        server.customRoles.forEach(r => {
            r.owner == msg.author.id ? counter++ : null
        })
        if(counter >= 2) {
            utl.embed.ping(msg, sMsg, 'у Вас уже есть 2 кастомные роли!')
            return
        }

        const user = await new DBUser(msg.guild.id, msg.author.id)

        if(user.discount && user.money >= 5000) {
            const m = await utl.embed(msg, sMsg, `Подтверждаете создание роли c цветом **${await fetchHEXName(hex)}** и названием **${name}**?\nТак как у Вас есть **скидка** за 4 приглашенных друзей, стоимость снижена на **50%**\nСтоимость роли на **30** дней — **${cost / 2}**${sweet}`)
            utl.reactionSelector.yesNo(m, msg.author.id,
                async () => {
                    await createRole(msg, name, hex, cost / 2)
                    const buyer = await new DBUser(msg.guild.id, msg.member.id)
                    buyer.discount -= 1
                    buyer.save()
                    m.delete()
                },
                () => {
                    m.delete()
                },
                () => {
                    m.delete()
                })
        } else if(user.money >= 10000) {
            const m = await utl.embed(msg, sMsg, `Подтверждаете создание роли c цветом **${await fetchHEXName(hex)}** и названием **${name}**?\nСтоимость роли на **30** дней — **${cost}** ${sweet}`)
            utl.reactionSelector.yesNo(m, msg.author.id,
                () => {
                    createRole(msg, name, hex, cost)
                    m.delete()
                },
                () => {
                    m.delete()
                },
                () => {
                    m.delete()
                }
            )
        }
        else
            utl.embed.ping(msg, sMsg, `у Вас не хватает ${sweet}! *(нужно 10.000${sweet})*\nИли пригласите **4 друзей** и получите скидку **50%**!`)
    }