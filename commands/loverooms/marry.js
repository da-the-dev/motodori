const Discord = require('discord.js')
const { db, embed, reactionSelector } = require('../../utility')
const { DBUser } = db
const sMsg = 'Свадбьа'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .marry @member
     */
    async (args, msg, client) => {
        const mMember = msg.mentions.members.first()
        if(!mMember) {
            embed(msg, sMsg, 'Вы не указали пару!')
            return
        }
        const users = await Promise.all([
            new DBUser(msg.guild.id, msg.member.id),
            new DBUser(msg.guild.id, mMember.id)
        ])
        if(users[0].mate) {
            embed(msg, sMsg, 'У Вас уже есть пара!')
            return
        }

        embed(msg, sMsg, `<@${mMember.id}>, <@${msg.member.id}> хочет пожениться на тебе/выйти за тебя замуж, что ответишь?`)
            .then(async m => {
                reactionSelector.yesNo(m, mMember.id,
                    async () => {
                        users[0].mate = mMember.id
                        users[1].mate = msg.member.id

                        await Promise.all(users.map(u => u.save()))
                    },
                    () => {
                        m.edit(embed.build(msg, sMsg, `<@${mMember.id}> тебе отказал(-а)`))
                        m.reactions.removeAll()
                    },
                    () => {
                        m.edit(embed.build(msg, sMsg, `<@${mMember.id}> тебя проигнорировал(-а)`))
                        m.reactions.removeAll()
                    }
                )
            })
    }
