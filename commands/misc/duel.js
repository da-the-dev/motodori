const Discord = require('discord.js')
const { embed, reactionSelector, db } = require('../../utility')
const { DBUser } = db
const { sweet } = require('../../constants.json').emojies
const words = ['атеист', 'атропа', 'ачинец', 'башлык', 'блесна', 'вармяк', 'вейник', 'взвизг', 'вивинг', 'витраж', 'гарпии', 'герман', 'геррес', 'гефест', 'глумец', 'гоголь', 'горбач', 'горжет', 'гренка', 'дауцин', 'деисус', 'европа', 'жасмин', 'желтяк', 'жеруха', 'забота', 'запись', 'зараза', 'иодизм', 'кабель', 'калита', 'каллус', 'карачи', 'каёмка', 'кетоза', 'кумпол', 'купрей', 'курцит', 'логгер', 'лялиус', 'мантра', 'маоизм', 'мастин', 'межняк', 'миасец', 'миорец', 'нерест', 'нсутит', 'одрина', 'осетин', 'песета', 'пихина', 'повеса', 'подвох', 'полуют', 'прядка', 'путное', 'ректор', 'рубрен', 'сахаит', 'сделка', 'серапе', 'серпок', 'сигмин', 'сирекс', 'скупит', 'снохач', 'соттии', 'спитам', 'страус', 'стювер', 'суфист', 'тайрон', 'тарань', 'таурин', 'терины', 'терцет', 'тинцит', 'толика', 'учение', 'фамудс', 'фиорит', 'флоппи', 'фразил', 'фуроат', 'фуэрос', 'хрящик', 'худрук', 'циклоп', 'черкес', 'чилига', 'шассер', 'шпинат', 'шпорец', 'экотип', 'энемон', 'юбилей', 'юморок', 'яловец', 'ятанин']
const sMsg = 'Дуэли'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .duel <?member> <bet>
     */
    async (args, msg, client) => {
        args.shift()
        const mMember = msg.mentions.members.first()
        if(!mMember) {
            embed(msg, sMsg, 'Вы не указали противника!')
            return
        }
        const bet = Number(args[1])
        if(!bet || !Number.isInteger(bet) || Number.isNaN(bet)) {
            embed(msg, sMsg, 'Неверная ставка!')
            return
        }

        const duelers = await Promise.all([
            new DBUser(msg.guild.id, msg.author.id),
            new DBUser(msg.guild.id, mMember.id)
        ])
        if(!duelers.every(d => d.money >= bet)) {
            embed.ping(msg, sMsg, `у дуэлянтов недостаточно ${sweet}!`)
            return
        }

        const m = await embed(msg, sMsg, `<@${mMember.id}>, <@${msg.author.id}> вызывает тебя на дуэль на ${bet}${sweet}. Струсишь или согласишься?`)
        reactionSelector.yesNo(m, mMember.id,
            async () => {
                m.reactions.removeAll()

                duelers.forEach(d => d.money -= bet)

                m.edit({ embed: embed.build(msg, `${sMsg}: ${msg.member.displayName} vs ${mMember.displayName}`, `<@${msg.author.id}>, <@${mMember.id}> начинается дуэль! Ждите кодовое слово. . .`) })
                const randomTime = Math.floor((Math.random() * (10 - 3) + 3) * 1000)
                setTimeout(async () => {
                    const keyWord = words[Math.floor(Math.random() * 100)]
                    m.edit({ embed: embed.build(msg, `СТРЕЛЯЙ`, `<@${msg.author.id}>, <@${mMember.id}>\nОГОНЬ! КОДОВОЕ СЛОВО: ${keyWord}`) })
                    const filter = (mm) => mm.author.id == mMember.id || mm.author.id == msg.author.id
                    const collected = await m.channel.awaitMessages(filter, { time: 10000, max: 1 })
                    if(collected.size <= 0) {
                        m.edit({ embed: embed.build(msg, `${sMsg}: ${msg.member.displayName} vs ${mMember.displayName}`, `Никто не решился стрелять, дуэль отменена`) })
                        return
                    }
                    const firstShot = collected.first().content == keyWord
                    const winnerID = collected.first().author.id
                    const loserID = duelers.find(d => d.id != winnerID).id
                    if(firstShot) {
                        m.edit({ embed: embed.build(msg, `${sMsg}: ${msg.member.displayName} vs ${mMember.displayName}`, `<@${winnerID}> выиграл!`) })

                        duelers.find(d => d.id == winnerID).money += bet
                        duelers.find(d => d.id != winnerID).money -= bet

                        await Promise.all(duelers.map(d => d.save()))
                    } else {
                        m.edit({ embed: embed.build(msg, `${sMsg}: ${msg.member.displayName} vs ${mMember.displayName}`, `<@${winnerID}> промахнулся! <@${loserID}> побеждает!`) })

                        duelers.find(d => d.id == loserID).money += bet
                        duelers.find(d => d.id != loserID).money -= bet

                        await Promise.all(duelers.map(d => d.save()))
                    }
                }, randomTime)
            },
            () => {
                m.reactions.removeAll()
                m.edit({ embed: embed.build(msg, sMsg, `<@${mMember.id}> струсил!`) })
            },
            () => {
                m.reactions.removeAll()
                m.edit({ embed: embed.build(msg, sMsg, `<@${mMember.id}> струсил!`) })
            }
        )
    }