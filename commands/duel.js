const Discord = require('discord.js')
const utl = require('../utility')
const { sweet } = require('../constants.json').emojies
const sMsg = 'Дуэли'

/**
 * Checks the balance of dueilers
 * @param {string} guildID - Guild ID
 * @param {string} caller - Caller ID
 * @param {string} dueiler - Second dueiler ID
 * @param {number} bet - Bet to check for
 * @returns {Promise<boolean>} If balances are valid
 */
const checkBal = (guildID, caller, dueiler, bet) => {
    return new Promise(async (resolve, reject) => {
        const db = await utl.db.createClient(process.env.MURL)
        var users = await Promise.all([db.get(guildID, caller), db.get(guildID, dueiler)])
        if(!users.every(u => u.money && u.money >= bet)) {
            resolve(false)
            db.close()
        }
        db.close()
        resolve(true)
    })
}

/**
 * Start a duel
 * @param {Discord.Message} msg - Original message
 * @param {Discord.Message} m - Response message
 * @param {Discord.GuildMember} caller - Original duelist
 * @param {Discord.GuildMember} duelist - Duelist who responded
 * @param {number} bet
 */
const startDuel = (m, msg, caller, duelist, bet) => {
    const roll = Math.random()
    if(roll < 0.5) {
        m.edit(utl.embed.build(msg, sMsg, `В **дуэли** одержал победу <@${caller.id}> и получил **${bet}**${sweet}\n\n**Вызов принял:** <@${duelist.id}>`))
        utl.db.createClient(process.env.MURL).then(async db => {
            var users = await Promise.all([db.get(msg.guild.id, caller.id), db.get(msg.guild.id, duelist.id)])
            users[0].money += bet
            users[1].money -= bet
            await Promise.all([db.set(msg.guild.id, caller.id, users[0]), db.set(msg.guild.id, duelist.id, users[1])])
            db.close()
        })
    }
    if(roll == 0.5) {
        m.edit(utl.embed.build(msg, sMsg, `**Дуэль** окончилась ничьей\n\n**Вызов принял:** <@${duelist.id}>`))
    }
    if(roll > 0.5) {
        m.edit(utl.embed.build(msg, sMsg, `В **дуэли** одержал победу <@${duelist.id}> и получил **${bet}**${sweet}\n\n**Вызов принял:** <@${duelist.id}>`))
        utl.db.createClient(process.env.MURL).then(async db => {
            var users = await Promise.all([db.get(msg.guild.id, caller.id), db.get(msg.guild.id, duelist.id)])
            users[0].money -= bet
            users[1].money += bet
            await Promise.all([db.set(msg.guild.id, caller.id, users[0]), db.set(msg.guild.id, duelist.id, users[1])])
            db.close()
        })
    }
    m.reactions.removeAll()
}

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .br <bet> <?member>
    */
    async (args, msg, client) => {
        var bet = Number(args[1])

        if(!Number.isInteger(bet) || bet < 50 || bet > 50000) {
            utl.embed.ping(msg, sMsg, `укажите **количество** ${sweet}, которое **не** меньше **50**${sweet} и **не** больше **50000**${sweet}`)
            return
        }

        var mMember = msg.mentions.members.first()
        if(mMember) {
            if(!await checkBal(msg.guild.id, msg.author.id, mMember.id, bet)) {
                utl.embed.ping(msg, sMsg, `дуэль с <@${mMember.id}> **не может** состояться, так как у вас недостаточно ${sweet}!`)
                return
            }
            const m = await utl.embed(msg, sMsg, `<@${mMember.id}>, <@${msg.author.id}> **вызывает** Вас на **дуэль** за **${bet}**${sweet}\nДля **согласия** нажмите на ✅, а для **отмены** ❌`)
            utl.reactionSelector.yesNo(m, mMember.id,
                () => {
                    startDuel(m, msg, msg.member, mMember, bet)
                },
                () => {
                    m.edit(utl.embed.build(msg, sMsg, `<@${msg.author.id}>, ><@${mMember.id}> **струсил**\n\n**Вызов принял:** <@${mMember.id}>`))
                    m.reactions.removeAll()
                },
                () => {
                    m.edit(utl.embed.build(msg, sMsg, `<@${msg.author.id}>, <@${mMember.id}> **струсил** и **не ответил** на Ваш вызов`))
                    m.reactions.removeAll()
                }
            )
        } else {
            const m = await utl.embed(msg, sMsg, `<@${msg.author.id}> хочет с кем-то **сразится** за **${bet}**${sweet}\n`)
            await m.react('✅')
            const filter = (reaction, user) => {
                return ['✅'].includes(reaction.emoji.name) && user.id != msg.author.id
            }
            m.awaitReactions(filter, { max: 1, time: 60000, errors: 'time' })
                .then(async reactions => {
                    const reaction = reactions.first()
                    const member = msg.guild.member(reaction.users.cache.last())

                    if(!await checkBal(msg.guild.id, msg.author.id, member.id, bet)) {
                        m.edit(utl.embed.build(msg, sMsg, `<@${msg.author.id}>, дуэль с <@${member.id}> **не может** состояться, так как у вас недостаточно ${sweet}!`))
                        m.reactions.removeAll()
                        return
                    }

                    startDuel(m, msg, msg.member, member, bet)
                })
        }

    }