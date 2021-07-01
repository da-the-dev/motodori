const Discord = require('discord.js')
const emojies = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

/**
 * Reacts to a message with 2 reactions and executes provided functions accordingly
 *
 * @param {Discord.Message} msg - Messsage to react to
 * @param {string} id - ID of the only user who can react
 * @param {Function} yes - "Yes" funciton
 * @param {Function} no - "No" function
 * @param {Function} fail - If timer runs out
 */
module.exports.yesNo = async (msg, id, yes, no, fail) => {
    await msg.react('✅')
    await msg.react('❌')

    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id == id
    }
    msg.awaitReactions(filter, { max: 1, time: 60000, errors: 'time' })
        .then(reactions => {
            const reaction = reactions.first()
            switch(reaction.emoji.name) {
                case '✅':
                    yes()
                    break
                case '❌':
                    no()
                    break
            }
        })
        .catch(err => {
            fail()
        })
}

/**
 * Reacts to a message with multiple reactions and executes provided functions accordingly
 *
 * @param {Discord.Message} msg - Messsage to react to
 * @param {string} id - ID of the only user who can react
 * @param {Function} cancel - "No" function
 * @param {Function} fail - If timer runs out
 * @param {*} funcs - Functions
 */
module.exports.multiselector = async (msg, id, cancel, fail, ...funcs) => {
    for(let i = 0; i < funcs.length; i++)
        await msg.react(emojies[i])
    await msg.react('❌')
    const filter = (reaction, user) => {
        return (emojies.includes(reaction.emoji.name) || reaction.emoji.name == '❌') && user.id == id
    }
    msg.awaitReactions(filter, { max: 1, time: 60000, errors: 'time' })
        .then(reactions => {
            const reaction = reactions.first()
            for(let i = 0; i < emojies.length; i++) {
                if(reaction.emoji.name == emojies[i]) {
                    funcs[i]()
                    return
                }
            }

            cancel()
        })
        .catch(err => {
            fail()
        })
}
