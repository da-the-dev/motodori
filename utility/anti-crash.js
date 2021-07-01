const Discord = require('discord.js')
const utl = require('../utility')
const { DBServer } = require('../utility/db')
const constants = require('../constants.json')

// Me, collector & felix
const whitelist = [process.env.MYID, '820196535940939806', '677923814914523144', '843147495550484480', '849672606647058462']

/**
 * Checks is "defenses" key value is "true" and then runs "func"
 *
 * @param {Function} func - Function to run
 * @returns
 */
const getDef = async (func) => {
    return (await new DBServer('836297404260155432')).def
}

/**
 * Takes away all admin roles from member and notifies in dms
 *
 * @param {Discord.GuildMember} member 
 * @param {string} reason
 */
const takeAndNotify = (member, reason) => {
    const roles = member.roles.cache.filter(r => r.permissions.has('ADMINISTRATOR'))
    roles.forEach(r => {
        member.roles.remove(r, `Подозрительная деятельность: ${reason}`)
            .catch(err => {
                console.log('[AC] takeAndNotify: fail to remove executor\'s admin roles', 'reason:', reason)
            })
        console.log('anticrash 1')
    })
    console.log("would've")
    member.user.createDM()
        .then(c => {
            c.send(utl.embed.sus(member.client, reason).setThumbnail())
        })
}

/**
 * Kicks an unautorised bot if protection wasn't lowered
 *
 * @param {Discord.GuildMember} member 
 */
module.exports.monitorBotInvites = async member => {
    if(member.user.bot) {
        console.log('dis a bot')
        if(await getDef()) {
            member.kick('Бот был добавлен, пока антикраш защита была включена')
            member.guild.fetchAuditLogs({ type: 28 })
                .then(audit => {
                    const executorID = Array.from(audit.entries.values())[0].executor.id
                    const executor = member.guild.members.cache.get(executorID)

                    if(whitelist.includes(executorID))
                        return

                    takeAndNotify(executor, 'несанкцианированное добавление бота')
                })
        }
    }
}


/**
 * Remove admin privilages from a role if one was updated with them
 *
 * @param {Discord.Role} oldRole
 * @param {Discord.Role} newRole
 */
module.exports.monitorRoleAdminPriviligeUpdate = async (oldRole, newRole) => {
    if(await getDef()) {
        if(!oldRole.permissions.has('ADMINISTRATOR') && newRole.permissions.has('ADMINISTRATOR')) {
            const audit = await newRole.guild.fetchAuditLogs({ type: 'ROLE_UPDATE' })
            const executor = Array.from(audit.entries.values())[0].executor

            if(whitelist.includes(executor.id))
                return

            await newRole.edit({
                permissions: newRole.permissions.remove('ADMINISTRATOR'),
            }, 'В роль были добавлены администраторские права, поэтому я их убрала ;)')

            takeAndNotify(newRole.guild.member(executor), 'выдача роли администраторских прав')
        }
    }
}

/**
 * Prevents admins from baning too many people in a short period of time
 *
 * @param {Discord.Guild} guild
 * @param {Discord.GuildMember} member
 */
module.exports.monitorBans = async (guild, member) => {
    const banPool = 10
    if(await getDef()) {
        guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' })
            .then(audit => {
                const executor = audit.entries.first().executor
                if(whitelist.includes(executor.id))
                    return

                // Executor Ban Entries
                let eBE = audit.entries.filter(e => e.executor.id == executor.id)
                eBE = eBE.sort((a, b) => { // Sort from OLD to NEW
                    if(a.createdTimestamp > b.createdTimestamp) return -1
                    if(a.createdTimestamp < b.createdTimestamp) return 1
                    return 0
                })

                // Save only 'banPool' last entries
                /**@type {Array<Discord.GuildAuditLogsEntry>} */
                const lastEBEs = Array.from(eBE.values()).slice(0, banPool)

                const eBEOld = lastEBEs[banPool - 1]
                const eBENew = lastEBEs[0]

                if(eBEOld)
                    if(eBENew.createdTimestamp - eBEOld.createdTimestamp < 120000)
                        takeAndNotify(guild.members.cache.get(executor.id), 'многочисленнные баны за короткий промежуток времени')
            })
    }
}

/**
 * Prevents admins from kicking too many people in a short period of time
 *
 * @param {Discord.GuildMember} member
 */
module.exports.monitorKicks = async (member) => {
    const kickPool = 10
    if(await getDef()) {
        const guild = member.guild
        guild.fetchAuditLogs({ type: 'MEMBER_KICK' })
            .then(audit => {
                const executor = audit.entries.first().executor
                if(whitelist.includes(executor.id))
                    return

                // Executor Kick Entries
                let eKE = audit.entries.filter(e => e.executor.id == executor.id)
                eKE = eKE.sort((a, b) => { // Sort from OLD to NEW
                    if(a.createdTimestamp > b.createdTimestamp) return -1
                    if(a.createdTimestamp < b.createdTimestamp) return 1
                    return 0
                })

                // Save only 'kickPool' last entries
                /**@type {Array<Discord.GuildAuditLogsEntry>} */
                const lastEKEs = Array.from(eKE.values()).slice(0, kickPool)

                const eKEOld = lastEKEs[kickPool - 1]
                const eKENew = lastEKEs[0]

                if(eKEOld)
                    if(eKENew.createdTimestamp - eKEOld.createdTimestamp < 120000)
                        takeAndNotify(guild.members.cache.get(executor.id), 'многочисленнные кики за короткий промежуток времени')
            })
    }
}

/**
 * Prevents admins from deleting too many roles
 *
 * @param {Discord.Role} role 
 */
module.exports.monitorRoleDelete = async role => {
    const kickPool = 2
    if(await getDef()) {
        const guild = role.guild
        guild.fetchAuditLogs({ type: 'ROLE_DELETE' })
            .then(audit => {
                const executor = audit.entries.first().executor
                if(whitelist.includes(executor.id))
                    return

                // Executor Role Delete Entries
                let eRDE = audit.entries.filter(e => e.executor.id == executor.id)
                eRDE = eRDE.sort((a, b) => { // Sort from OLD to NEW
                    if(a.createdTimestamp > b.createdTimestamp) return -1
                    if(a.createdTimestamp < b.createdTimestamp) return 1
                    return 0
                })

                // Save only 'kickPool' of entries
                /**@type {Array<Discord.GuildAuditLogsEntry>} */
                const lastERDEs = Array.from(eRDE.values()).slice(0, kickPool)


                const eRDEOld = lastERDEs[kickPool - 1]
                const eRDENew = lastERDEs[0]

                if(eRDEOld)
                    if(eRDENew.createdTimestamp - eRDEOld.createdTimestamp < 120000) {
                        guild.roles.create(role, 'Восстановлена удаленная роль')
                        takeAndNotify(guild.members.cache.get(executor.id), 'многочисленнные удаления ролей за короткий промежуток времени')
                    }
            })
    }
}

/**
 * Prevents admins from deleting too many channels
 *
 * @param {Discord.GuildChannel} channel 
 */
module.exports.monitorChannelDelete = async channel => {
    const kickPool = 2
    if(channel.parent && channel.parentID != constants.categories.privateRooms)
        if(await getDef()) {
            const guild = channel.guild
            guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' })
                .then(audit => {
                    const executor = audit.entries.first().executor
                    if(whitelist.includes(executor.id))
                        return

                    // Executor Role Delete Entries
                    let eCDE = audit.entries.filter(e => e.executor.id == executor.id)
                    eCDE = eCDE.sort((a, b) => { // Sort from OLD to NEW
                        if(a.createdTimestamp > b.createdTimestamp) return -1
                        if(a.createdTimestamp < b.createdTimestamp) return 1
                        return 0
                    })

                    // Save only 'kickPool' of entries
                    /**@type {Array<Discord.GuildAuditLogsEntry>} */
                    const lastECDEs = Array.from(eCDE.values()).slice(0, kickPool)

                    const eCDEOld = lastECDEs[kickPool - 1]
                    const eCDENew = lastECDEs[0]

                    if(eCDEOld)
                        if(eCDENew.createdTimestamp - eCDEOld.createdTimestamp < 120000)
                            takeAndNotify(guild.members.cache.get(executor.id), 'многочисленнные удаления каналов за короткий промежуток времени')
                })
        }
}