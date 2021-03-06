const Discord = require('discord.js')
const utl = require('../../utility')
const { getGuild, DBServer, DBUser } = utl.db
const sMsg = 'Информация о роли'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .rst <rolePos>
     */
    async (args, msg, client) => {
        if(!args[1]) {
            utl.embed.ping(msg, sMsg, 'не указан индекс роли!')
            return
        }
        if(!args[1][0] == 'c' || !Number.isInteger(Number(args[1].slice(1)))) {
            utl.embed.ping(msg, sMsg, 'неверный индекс роли!')
            return
        }

        const pos = args[1].slice(1)

        const elements = await Promise.all([
            new DBServer(msg.guild.id),
            new DBUser(msg.guild.id, msg.author.id),
            getGuild(msg.guild.id)
        ])
        const server = elements[0]
        const user = elements[1]
        const guild = elements[2]

        // If selected role doesn't exist on the server
        if(!msg.guild.roles.cache.get(user.customInv[pos - 1])) {
            utl.embed.ping(msg, sMsg, 'такой роли не существует!')
            // Validate roles
            user.customInv = user.customInv.filter(r => msg.guild.roles.cache.get(r))
            user.save()
            return
        }
        // Check out of range
        const roleID = user.customInv[pos - 1]
        if(!roleID) {
            utl.embed.ping(msg, sMsg, 'у Вас нет такой кастомной роли!')
            return
        }
        // Check ownership
        if(!server.customRoles.find(r => r.owner == msg.author.id && r.id == roleID)) {
            utl.embed.ping(msg, sMsg, 'эта роль Вам не принадлежит!')
            return
        }

        const role = server.customRoles.find(r => r.id == roleID)
        role.members = guild.filter(m => m.customInv && m.customInv.includes(role.id)).length
        server.customRoles[server.customRoles.indexOf(role)].members = role.members
        server.save()

        console.log(role.expireTimestamp)

        const discordRole = msg.guild.roles.cache.get(roleID)

        const embed = new Discord.MessageEmbed()
            .setTitle('Информация о роли')
            .setDescription(`
                Роль: <@&${role.id}>
                Владелец: <@${role.owner}>
                Носителей: **${role.members}** из **${role.maxHolders}**
                
                ID роли: **${role.id}**\n
                Цвет роли: **${discordRole.hexColor}**
                Действует до: **${new Date(role.expireTimestamp).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}**
                Куплена: **${new Date(role.createdTimestamp).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })}**, **${new Date(role.createdTimestamp).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}**
                `)
            .setColor('#2F3136')
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))

        msg.channel.send(embed)
    }