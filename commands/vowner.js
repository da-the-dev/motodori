const Discord = require(`discord.js`)
const constants = require(`../constants.json`)
const utl = require(`../utility`)
const sMsg = `Приватные комнаты`

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .vowner <member>
     */
    async (args, msg, client) => {
        if(msg.member.voice.channel.parentID != constants.categories.privateRooms)
            return

        if(!msg.member.permissionsIn(msg.member.voice.channel).has(`CREATE_INSTANT_INVITE`)) {
            utl.embed(msg, sMsg, `<@${msg.author.id}>, у Вас нет прав на эту команду!`)
            return
        }

        /**@type {Discord.VoiceChannel} */
        var room = msg.member.voice.channel

        if(!room) {
            utl.embed(msg, sMsg, `<@${msg.author.id}>, у Вас нет приватной комнаты!`)
            return
        }
        var mMember = msg.mentions.members.first()

        if(mMember) { // Member mentioned
            if(mMember.voice.channelID == room.id) {
                var oldOwner = msg.member
                var mMember = msg.mentions.members.first()

                if(room.permissionOverwrites.find(o => o.id == msg.member.id && o.allow.has(`CREATE_INSTANT_INVITE`))) {// If creator
                    room.permissionOverwrites.delete(msg.author.id)
                    room.overwritePermissions(
                        room.permissionOverwrites.set(mMember.id, {
                            id: mMember.id,
                            allow: 'CREATE_INSTANT_INVITE'
                        })).then(() => {
                            utl.embed(msg, sMsg, `<@${msg.author.id}>, Вы **передали права** владения комнаты <@${mMember.id}>`)
                        })
                }
            } else
                utl.embed(msg, sMsg, `<@${msg.author.id}>, Пользователь не находится в Вашей комнате!`)
        } else
            utl.embed(msg, sMsg, `<@${msg.author.id}>, Вы не указали пользователя!`)
    }