const Discord = require(`discord.js`)
const constants = require('../../constants.json')
const { MessageButton } = require('discord-buttons')

const { embed } = require('../../utility')
const sMsg = `Приватные комнаты`

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .psact <activity>
     */
    async (args, msg, client) => {
        if(!msg.member.voice || msg.member.voice.channel.parentID != constants.categories.privateRooms) {
            embed(msg, sMsg, `<@${msg.author.id}>, для начала создайте приватную комнату!`)
            return
        }

        if(!msg.member.permissionsIn(msg.member.voice.channel).has(`CREATE_INSTANT_INVITE`)) {
            embed(msg, sMsg, `<@${msg.author.id}>, у Вас нет прав на эту команду!`)
            return
        }

        const room = msg.member.voice.channel
        if(!room) {
            embed(msg, sMsg, `<@${msg.author.id}>, у Вас нет приватной комнаты!`)
            return
        }

        const button = new MessageButton()
            .setLabel('Ссылка на активность')
            .setStyle('url')

        switch(args[1]) {
            case 'youtube':
                msg.channel.send('‎‎‎‎‏‏‎ ‎‏‏‎ ',
                    button.setURL(`https://discord.com/invite/${(await room.activityInvite('755600276941176913')).code}`)
                )
                break
            case 'poker':
                msg.channel.send('‎‎‎‎‏‏‎ ‎‏‏‎ ',
                    button.setURL(`https://discord.com/invite/${(await room.activityInvite('755827207812677713')).code}`)
                )
                break
            case 'betray':
                msg.channel.send('‎‎‎‎‏‏‎ ‎‏‏‎ ',
                    button.setURL(`https://discord.com/invite/${(await room.activityInvite('773336526917861400')).code}`)
                )
                break
            case 'fish':
                msg.channel.send('‎‎‎‎‏‏‎ ‎‏‏‎ ',
                    button.setURL(`https://discord.com/invite/${(await room.activityInvite('814288819477020702')).code}`)
                )
                break
            default:
                embed.ping(msg, sMsg, 'доступные активности:\n`youtube` для YouTube Together\n`poker` для Poker Night\n`betray` для Betrayal.io\n`fish` для Fishington.io')
                break
        }
    }