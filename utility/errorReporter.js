const { Message, MessageEmbed } = require('discord.js')

/**
 * 
 * @param {Message} lastMessage 
 * @param {string} err 
 */
module.exports = (lastMessage, err) => {
    try {
        const embed = new MessageEmbed(
            {
                "title": `Ошибка с сервера ${lastMessage.guild.name}`,
                "description": `Бот: ${lastMessage.client.user.tag}\nСсылка на последнее сообщение: [ссылка](${lastMessage.url})\n\nСодержание ошибки:\n\`\`\`\n${err}\n\`\`\`\n`,
                "color": 15406156,
                "footer": {
                    "text": lastMessage.client.user.tag,
                    "icon_url": lastMessage.client.user.displayAvatarURL({ dynamic: true })
                }
            }
        )
        lastMessage.client.guilds.cache.get('620690898015223848').channels.cache.get('850443434791010325').send(embed)
    } catch(err) {
        console.log('No last message!\n', err)
    }
}