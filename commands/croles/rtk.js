const Discord = require('discord.js')
const utl = require('../../utility')
const { getConnection, DBUser, DBServer } = utl.db
const sMsg = 'Выдача кастомной роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .rgv <member> <rolePos>
    */
    async (args, msg, client) => {
        var mMember = msg.mentions.members.first()
        if(!mMember) {
            utl.embed.ping(msg, sMsg, 'не указан пользователь!')
            return
        }
        if(!args[2]) {
            utl.embed.ping(msg, sMsg, 'не указана роль!')
            return
        }
        if(args[2][0] != 'c' || !Number.isInteger(Number(args[2].slice(1)))) {
            utl.embed.ping(msg, sMsg, 'указан неверный индекс роли!')
            return
        }
        const pos = args[2].slice(1)

        const elements = await Promise.all([
            new DBServer(msg.guild.id, getConnection()),
            new DBUser(msg.guild.id, msg.author.id, getConnection()),
            new DBUser(msg.guild.id, mMember.id, getConnection())
        ])
        const server = elements[0]
        const sender = elements[1]
        const receiver = elements[2]

        // Check if has roles at all
        if(!sender.customInv) {
            utl.embed.ping(msg, sMsg, 'у Вас нет кастомных ролей!')
            return
        }
        // If selected role doesn't exist on the server
        if(!msg.guild.roles.cache.get(server.customRoles[pos - 1].id)) {
            utl.embed.ping(msg, sMsg, 'такой роли не существует!')
            // Validate roles
            sender.customInv = sender.customInv.filter(r => msg.guild.roles.cache.get(r))
            sender.save()
            return
        }
        // Check out of range
        const role = sender.customInv[pos - 1]
        if(!role) {
            utl.embed.ping(msg, sMsg, 'у Вас нет такой кастомной роли!')
            return
        }
        // Check ownership
        if(!server.customRoles.find(r => r.owner == msg.author.id && r.id == role)) {
            utl.embed.ping(msg, sMsg, 'эта роль Вам не принадлежит!')
            return
        }
        // Check if receiver has the role
        if(!receiver.customInv.find(r => r == role)) {
            utl.embed.ping(msg, sMsg, `этой роли нет у ${mMember}!`)
            return
        }

        server.customRoles.find(r => role).members--
        server.save()

        receiver.customInv.splice(receiver.customInv.indexOf(r => r.id == role), 1)
        receiver.save()

        mMember.roles.remove(role)

        utl.embed(msg, sMsg, `Роль <@&${role.id}> была забрана у <@${mMember.id}>`)
    }