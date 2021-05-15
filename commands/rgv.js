const Discord = require('discord.js')
const utl = require('../utility')
const sMsg = 'Выдача кастомной роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .rgv <member> <rolePos>
    */
    (args, msg, client) => {
        var mMember = msg.mentions.members.first()
        if(!args[2] || !args[2][0] == 'c' || !Number.isInteger(Number(args[2].slice(1)))) {
            utl.embed(msg, sMsg, 'Указан неверный индекс роли!')
            return
        }
        var pos = args[2].slice(1)
        if(!mMember) {
            utl.embed(msg, sMsg, 'Не указан пользователь!')
            return
        }
        if(!pos) {
            utl.embed(msg, sMsg, 'Не указана роль!')
            return
        }

        utl.db.createClient(process.env.MURL).then(async db => {
            var userData = await db.get(msg.guild.id, msg.author.id)
            if(!userData || !userData.customInv || !userData.customInv[pos - 1]) {
                utl.embed(msg, sMsg, 'У Вас нет кастомных ролей')
                db.close()
                return
            }

            var serverData = await db.getServer(msg.guild.id)
            var role = serverData.customRoles.find(r => r.id == userData.customInv[pos - 1])
            if(!role) {
                utl.embed(msg, sMsg, 'Эта роль Вам не принадлежит!')
                db.close()
                return
            }

            var recipientData = await db.get(msg.guild.id, mMember.id)
            if(recipientData.customInv && recipientData.customInv.find(r => r == role.id)) {
                utl.embed(msg, sMsg, `Эта роль уже есть у <@${mMember.id}>!`)
                db.close()
                return
            }

            serverData.customRoles[serverData.customRoles.findIndex(r => r.id == role.id && r.owner == msg.author.id)].members += 1
            utl.embed(msg, sMsg, `Роль <@&${role.id}> была выдана <@${mMember.id}>`)

            db.update(msg.guild.id, mMember.id, { $push: { customInv: role.id } }).then(() => {
                db.setServer(msg.guild.id, serverData).then(() => db.close())
            })
        })
    }