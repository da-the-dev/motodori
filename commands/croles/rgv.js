const Discord = require('discord.js')
const utl = require('../../utility')
const { getGuild, DBUser, DBServer } = utl.db
const sMsg = 'Выдача кастомной роли'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .rgv <member> <rolePos>
     */
    async (args, msg, client) => {
        const mMember = msg.mentions.members.first()
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
            new DBServer(msg.guild.id),
            new DBUser(msg.guild.id, msg.author.id),
            new DBUser(msg.guild.id, mMember.id)
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
        if(!msg.guild.roles.cache.get(sender.customInv[pos - 1])) {
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
        if(receiver.customInv && receiver.customInv.find(r => r == role)) {
            utl.embed.ping(msg, sMsg, `эта роль уже есть у ${mMember}!`)
            return
        }
        // Check if max role limit
        const serverRoleData = server.customRoles.find(r => r.owner == msg.author.id && r.id == role)
        if(serverRoleData.members == serverRoleData.maxHolders) {
            utl.embed.ping(msg, sMsg, 'эта роль выдана максимальному количеству участников!')
            return
        }

        const guild = await getGuild(msg.guild.id)
        server.customRoles[server.customRoles.findIndex(r => r.id == role)].members = guild.filter(m => m.customInv && m.customInv.includes(role)).length
        server.save()

        receiver.customInv ? receiver.customInv.push(role) : receiver.customInv = [role]
        receiver.save()

        utl.embed(msg, sMsg, `Роль <@&${role}> была выдана <@${mMember.id}>`)
    }