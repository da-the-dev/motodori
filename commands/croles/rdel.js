const Discord = require('discord.js')
const utl = require('../../utility')
const { getConnection, DBServer, DBUser } = utl.db
const sMsg = 'Удаление кастомной роли'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .rdel <rolePos>
    */
    async (args, msg, client) => {
        if(!args[1]) {
            utl.embed.ping(msg, sMsg, 'не указан индекс роли!')
            return
        }
        if(args[1][0] != 'c' || !Number.isInteger(Number(args[1].slice(1)))) {
            utl.embed.ping(msg, sMsg, 'указан неверный индекс роли!')
            return
        }
        const pos = args[1].slice(1)

        /*
        Check:
        if has roles at all
        if owner
        */

        const elements = await Promise.all([
            new DBServer(msg.guild.id, getConnection()),
            new DBUser(msg.guild.id, msg.author.id, getConnection()),
        ])
        const server = elements[0]
        const user = elements[1]

        if(!user.customInv) {
            utl.embed.ping(msg, sMsg, 'у Вас нет кастомных ролей!')
            return
        }

        // If selected role doesn't exist on the server
        if(!msg.guild.roles.cache.get(server.customRoles[pos - 1].id)) {
            utl.embed.ping(msg, sMsg, 'такой роли не существует!')
            // Validate roles
            user.customInv = sender.customInv.filter(r => msg.guild.roles.cache.get(r))
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

        server.customRoles.splice(server.customRoles.findIndex(r => r.id == role), 1)
        server.save()
        user.customInv.splice(user.customInv.findIndex(r => r == role), 1)
        user.save()

        msg.guild.roles.cache.get(role).delete(`Удалена ${msg.author.tag} командой .rdel`).then(role => {
            utl.embed(msg, sMsg, `Роль **${role.name}** удалена`)
        })

    }