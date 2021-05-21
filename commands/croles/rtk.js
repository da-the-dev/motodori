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

        const user = await new DBUser(msg.guild.id, msg.author.id, getConnection())
        if(!user.customInv) {
            utl.embed.ping(msg, sMsg, 'у Вас нет кастомных ролей')
            return
        }

        const server = await new DBServer(msg.guild.id, getConnection())
        const role = server.customRoles.find(r => r.id == user.customInv[pos - 1] && r.owner == msg.author.id)
        if(!role) {
            utl.embed.ping(msg, sMsg, 'эта роль Вам не принадлежит!')
            return
        }

        const recipient = await new DBUser(msg.guild.id, mMember.id, getConnection())
        if(!recipient.customInv || !recipient.customInv.find(r => r == role.id)) {
            utl.embed.ping(msg, sMsg, `этой роли нет у <@${mMember.id}>!`)
            return
        }

        server.customRoles.find(r => r.id).members--
        server.save()
        recipient.customInv.splice(recipient.customInv.indexOf(r => r.id == role.id), 1)
        mMember.roles.remove(role.id)
        recipient.save()

        utl.embed(msg, sMsg, `Роль <@&${role.id}> была забрана у <@${mMember.id}>`)
    }