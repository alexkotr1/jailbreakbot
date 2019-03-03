const config = require("../config"),
   db = require("../utilities/db").db,
 { RichEmbed } = require("discord.js")

module.exports = async function (message,member,reason,type,punishment_variable,date_to_unmute){
    await message.delete().catch(console.error);
    const db_case = await db.get("cases")
    const caseNumber = db_case ? parseInt(db_case) : 0
    const moderator = message.author
    if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.reply(`You do not have the authority to perform moderation actions on ${member.displayName}.`);
    const modlog = message.guild.channels.get(config.public_mod_logs);
    if (!modlog) return message.reply("You haven't set a mod logging channel!").then(e=>e.delete(3000));
    const can_take_action = await db.exists("action_" + member.user.id)
    if (can_take_action) return message.reply("You have to wait 10 seconds till you perform another action on " + member + '.').then(e=>e.delete(3000))
    const db_points = await db.hget("warnpoints", member.user.id)
    const points_before_warn = db_points ? parseInt(db_points) : 0
    const mutedRole = message.guild.roles.get(config.muted);
    switch(type){
        case 'warn':
        await db.hincrby("warnpoints", member.user.id, punishment_variable).catch(console.error);
        if (points_before_warn + punishment_variable >= 400) {
            if (points_before_warn + punishment_variable >= 600) {
                await member.ban({days: 7,reason: "Exceeded warn points limit."})
                await db.hdel("warnpoints", member.user.id)
            } else {
                await member.kick().catch(console.error);
            }
        }
        await member.user.send(`You have been warned by **${message.author.tag}** with **${punishment_variable}** points for: ${reason}.`).catch(console.error)
        break;
        case 'lift-warn':
        if (points_before_warn - punishment_variable <= 0) await db.hdel("warnpoints", member.user.id)
        else await db.hincrby('warnpoints', member.user.id, `-${punishment_variable}`)
        await member.user.send(`You have been de-warned by **${message.author.tag}** with **${punishment_variable}** points for: ${reason}.`).catch(console.error)
        break;
        case 'mute' :
        const db_muted = await db.exists(`${member.user.id}mutedInfo`).catch(console.error);
        if (db_muted) return message.reply(`${member.user.tag} is already muted.`).then(e=>e.delete(3000)).catch(console.error);
        var time = parseInt(punishment_variable.substr(0, punishment_variable.length - 1));
        const c_type = punishment_variable.replace(time.toString(), "");
        if (c_type === 's') {
            punishment_variable = `${time.toString()} ${time == 1 ? 'second' : 'seconds'}`;
            time = time * 1000;
        } else if (c_type === 'm') {
            punishment_variable = `${time.toString()} ${time == 1 ? 'minute' : 'minutes'}`;
            time = time * 60000;
        } else if (c_type === 'h') {
            punishment_variable = `${time.toString()} ${time == 1 ? 'hour' : 'hours'}`;
            time = time * 3600000
        } else if (c_type === 'd') {
            punishment_variable = `${time.toString()} ${time == 1 ? 'day' : 'days'}`;
            time = time * 86400000
        } else if (c_type === 'w') {
            punishment_variable = `${time.toString()} ${time == 1 ? 'week' : 'weeks'}`;
            time = time * 604800000
        }
        const date_to_unmute = Date.now() + time;
        if (!mutedRole) return message.reply("I couldn't find the mute role.").then(e=>e.delete(3000));
        await member.addRole(mutedRole)
        await db.hmset(`${member.user.id}mutedInfo`,'date_to_unmute',date_to_unmute,'case',caseNumber);
        break;
        case 'kick' : 
        if (!member.kickable) return message.reply("I don't have permission to perform this action.").then(e=>e.delete(3000))
        await member.kick(reason).catch(console.error)
        await member.user.send(`You have been kicked from r/Jailbreak for the following reason: ${reason}.`).catch(console.error)
        break;
        case 'ban' :
        if (!member.bannable) return message.reply("I don't have permission to perform this action.").then(e=>e.delete(3000))
        await member.ban({days:7, reason:reason}).catch(console.error)
        await member.user.send(`You have been kicked from r/Jailbreak for the following reason: ${reason}.`).catch(console.error)
        punishment_variable = 'Permanently'
        break;
        case 'unmute' :
        punishment_variable = await db.hget(`${member.user.id}mutedInfo`,"case").catch(console.error);
        if (!mutedRole) return message.reply("I couldn't find the mute role.").then(e=>e.delete(3000)).catch(console.error);
        if (!punishment_variable && !member.roles.exists("id",config.muted)) message.reply(`${member.user.tag} is not muted.`).then(e=>e.delete(3000)).catch(console.error);
        else if (!punishment_variable && member.roles.exists("id",config.mutedRole)) await member.removeRole(mutedRole).catch(console.error)
        else {
            await member.removeRole(mutedRole).catch(console.error)
            await db.del(`${member.user.id}mutedInfo`);
        }
        break;
    }
    await modlog.send(buildModEmbed(member,moderator,reason,type,punishment_variable,caseNumber))
    await db.set("action_" + member.user.id,'1','EX','10');
    const punishment_object = {
        case_number : caseNumber,
        user : member.user.id,
        mod : message.author.id,
        mod_tag : message.author.tag,
        type : type,
        punishment_variable : punishment_variable,
        reason : reason,
        date : Date.now()
    }
    await db.hmset("cases_details",caseNumber.toString(),JSON.stringify(punishment_object));
    await db.incr("cases")
    await db.bgsave();
}

function buildModEmbed(member,mod,reason,type,punishment_variable,caseNumber){
    const embed = new RichEmbed()
    .setTitle(`Member ${type === 'ban' ? 'Banned' : type === 'warn' ? 'Warned' : type === 'lift-warn' ? 'De-Warned' : type === 'mute' ? 'Muted' : type === 'kick' ? 'Kicked' : 'Unmuted'}`)
    .setColor(type === 'ban' ? 0x3498DB : type === 'warn' ? 0xffa500 : type === 'lift-warn' ? 0xA84300 : type === 'mute' ? 0xE91E63 : type === 'kick' ? 0x00AE86 : 0xAD1457)
    .setFooter(`Case #${caseNumber} | ${member.user.id}`)
    .setTimestamp()
    .addField("Member", `${member.user.tag}(${member})`, true)
    .addField("Mod", mod.tag, true)
    .setThumbnail(member.user.avatarURL)
    if (type !== 'kick') embed.addField((type === 'ban' || type === 'mute') ? 'Duration' : type === 'warn' ? 'Increase' : type === 'unmute' ? 'Original Case' : 'Decrease', ` ${punishment_variable} ${(type === 'warn' || type === 'lift-warn') ? ' Points' : ''}`, true)
    if (type !== 'unmute') embed.addField("Reason", reason,true)
    return { embed }
}