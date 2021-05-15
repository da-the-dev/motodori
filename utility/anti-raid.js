const Discord = require('discord.js')
/**
 * Kicks aaccount that are younger than 3 days
 * @param {Discord.GuildMember} member - Member to check
 * @param {Discord.Client} client - Bot client
 */

module.exports = (member, client) => {
    if(Date.now() - member.user.createdTimestamp < 259200000) {
        member.createDM(true)
            .then(c => {
                const embed = new Discord.MessageEmbed()
                    .setColor('#2F3136')
                    .setAuthor(`Вы были кикнуты с сервера ${client.guilds.cache.first().name}', 'https://cdn.discordapp.com/attachments/810255515854569472/813821208670765057/photodraw.ru-35920.png`)
                    .setDescription(`Вы были кикнуты с сервера, так как Ваш аккаунт был создан менее, чем 3 дня назад, поэтому мы заподозрили рейд.`)
                    .setFooter(`Уведомила ${client.user.username} Обратитесь к другим администраторам для выяснения обстоятельств`, client.user.avatarURL())
                c.send()
            })
        member.kick('Аккаунт моложе 3 дней')
    }
}