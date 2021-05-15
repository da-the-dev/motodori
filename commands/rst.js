const Discord = require('discord.js')
const utl = require('../utility')
const sMsg = 'Информация о роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .rst <rolePos>
    */
    (args, msg, client) => {
        if(!args[1]) {
            utl.embed(msg, sMsg, 'Не указан индекс роли!')
            return
        }
        if(!args[1][0] == 'c' || !Number.isInteger(Number(args[1].slice(1)))) {
        }
        var pos = args[1].slice(1)

        if(!pos) {
            utl.embed(msg, sMsg, 'Не указана роль!')
            return
        }

        utl.db.createClient(process.env.MURL).then(async db => {
            var userData = await db.get(msg.guild.id, msg.author.id)
            if(!userData || !userData.customInv) {
                utl.embed(msg, sMsg, 'У Вас нет кастомных ролей')
                db.close()
                return
            }

            var serverData = await db.getServer(msg.guild.id)
            var role = serverData.customRoles.find(r => r.id == userData.customInv[pos - 1])
            if(!serverData.customRoles.find(r => r.id == userData.customInv[pos - 1])) {
                utl.embed(msg, sMsg, 'Эта роль Вам не принадлежит!')
                db.close()
                return
            }

            var discordRole = msg.guild.roles.cache.get(role.id)
            var expireDate = new Date(role.expireTimestamp)
            var creationDate = new Date(discordRole.createdTimestamp)

            var embed = new Discord.MessageEmbed()
                .setTitle('<:dot:835981467879342160>Информация о роли')
                .setDescription(`Роль: <@&${role.id}>\nВладелец: <@${role.owner}>\nНосителей: **${role.members}** из **5**\n\nID роли: **${role.id}**\nЦвет роли: **${discordRole.hexColor}**\nДействует до: **${expireDate.toLocaleDateString()}**, **00:00:00**\nКуплена: **${creationDate.toLocaleDateString()}**, **${creationDate.toLocaleTimeString()}**`)
                .setColor('#2F3136')
                .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))

            msg.channel.send(embed)
            db.close()
        })
    }