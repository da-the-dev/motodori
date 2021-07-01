const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser, DBServer } = utl.db
const { sweet } = require('../../constants.json').emojies
const sMsg = 'Изменение роли'

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .redit <pos> <edit|name> <value>
     */
    async (args, msg, client) => {
        if(!args[1]) {
            utl.embed.ping(msg, sMsg, 'не указана роль!')
            return
        }
        if(args[1][0] != 'c' || !Number.isInteger(Number(args[1].slice(1)))) {
            utl.embed.ping(msg, sMsg, 'указан неверный индекс роли!')
            return
        }

        const pos = args[1].slice(1)

        const elements = await Promise.all([
            new DBServer(msg.guild.id),
            new DBUser(msg.guild.id, msg.author.id),
        ])
        const server = elements[0]
        const user = elements[1]

        // Check if has roles at all
        if(!user.customInv) {
            utl.embed.ping(msg, sMsg, 'у Вас нет кастомных ролей!')
            return
        }
        // If selected role doesn't exist on the server
        if(!msg.guild.roles.cache.get(user.customInv[pos - 1])) {
            utl.embed.ping(msg, sMsg, 'такой роли не существует!')
            // Validate roles
            user.customInv = user.customInv.filter(r => msg.guild.roles.cache.get(r))
            user.save()
            return
        }
        // Check out of range
        const role = user.customInv[pos - 1]
        if(!role) {
            utl.embed.ping(msg, sMsg, 'у Вас нет такой кастомной роли!')
            return
        }
        // Check ownership
        if(!server.customRoles.find(r => r.owner == msg.author.id && r.id == role)) {
            utl.embed.ping(msg, sMsg, 'эта роль Вам не принадлежит!')
            return
        }

        if(!args[2]) {
            utl.embed.ping(msg, sMsg,
                `не указано действие!
                \`\`\`Доступные действия:\n1.name новое имя роли\n2.hex #hex\`\`\``)
            return
        }

        switch(args[2]) {
            case 'name': {
                args.shift()
                args.shift()
                args.shift()

                const name = args.join(' ')
                if(!name) {
                    utl.embed.ping(msg, sMsg, 'не указано название роли!')
                    return
                }

                const discordRole = msg.guild.roles.cache.get(role)
                const oldName = discordRole.name
                discordRole.setName(name, `Изменено ${msg.author} командой .redit`)
                utl.embed.ping(msg, sMsg, `название роли **${oldName}** изменено на **${name}**`)
                break
            }
            case 'hex': {
                args.shift()
                args.shift()
                args.shift()

                let hex = args[0]
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

                const discordRole = msg.guild.roles.cache.get(role)
                discordRole.setColor(hex, `Изменено ${msg.author} командой .redit`)
                utl.embed.ping(msg, sMsg, `цвет роли изменен c **${discordRole.hexColor}** на **${hex}**`)
                break
            }
            case 'extend': {
                if(user.money < 2000) {
                    utl.embed.ping(msg, sMsg, `продление роли на месяц стоит 2000${sweet}!`)
                    return
                }

                const selectedRole = user.customInv[pos - 1]
                const serverRoleIndex = server.customRoles.findIndex(r => r.id == selectedRole)

                // Add a month
                const extendedDate = new Date(server.customRoles[serverRoleIndex].expireTimestamp + 30 * 24 * 60 * 60 * 1000)
                extendedDate.setUTCHours(0, 0, 0, 0)
                server.customRoles[serverRoleIndex].expireTimestamp = extendedDate.getTime()
                server.save()

                user.money -= 2000
                user.save()

                utl.embed(msg, sMsg, `Роль <@&${selectedRole}> была продлена на месяц`)
                break
            }
            case 'expand': {
                const amount = args[3]
                if(!amount) {
                    utl.embed.ping(msg, sMsg, 'не указано количество мест для увеличения!')
                    return
                }
                if(user.money < amount * 500) {
                    utl.embed.ping(msg, sMsg, `у Вас недостаточно средст для покупки **${amount}** мест!
                                                *(нужно ${amount * 500}${sweet})*`)
                    return
                }

                const selectedRole = user.customInv[pos - 1]
                const serverSelRole = server.customRoles.findIndex(r => r.id == selectedRole)

                server.customRoles[serverSelRole].maxHolders += Number(amount)
                server.save()

                user.money -= 500 * amount
                user.save()

                utl.embed(msg, sMsg, `Максимальное количество владельцев <@&${selectedRole}> было увеличено до **${amount}**`)
                break
            }

            default:
                utl.embed.ping(msg, sMsg,
                    `указано неизвестное действие!
                    \`\`\`Доступные действия:\n1.name новое имя роли\n2.hex #hex\`\`\``)
                break
        }
    }