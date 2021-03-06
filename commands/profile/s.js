const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser } = utl.db
const sMsg = 'Статус'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .s <?status>
     */
    async (args, msg, client) => {
        args.shift()

        if(args.length <= 0) {
            const user = await new DBUser(msg.guild.id, msg.author.id)
            user.status = ''
            await user.save()

            utl.embed(msg, sMsg, `<@${msg.author.id}>, Ваш статус успешно удален`)
            return
        }


        const user = await new DBUser(msg.guild.id, msg.author.id)

        let state = args.join(' ')
        state = state.slice(0, state.length <= 60 ? state.length : 60)
        state = state.replace(/[\S]+(.com|.ru|.org|.net|.info)[\S]+/g, '')

        user.status = state
        await user.save()

        utl.embed(msg, sMsg, `<@${msg.author.id}>, Ваш статус успешно установлен`)
    }