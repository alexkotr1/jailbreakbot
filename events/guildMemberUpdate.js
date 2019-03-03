const config = require("../config"),
      functions = require("../functions/functions").modules,
      { RichEmbed } = require("discord.js")


exports.guildMemberUpdate = async function(old,newM){
    if (newM.guild.id !== config.rjb) return undefined
    const embed = new RichEmbed()
    .addField("User", newM.user.tag, true)
    .setThumbnail(newM.user.avatarURL)
    .setColor(0x0297DB)
    .setFooter(newM.user.id)
    .setTimestamp()
        if (newM.nickname && !old.nickname) {
            embed.setTitle("Nickname Set")
            embed.addField("User", newM.user.tag, true)
            embed.addField("Nickname", newM.nickname)
            return functions.log(embed)
        } else if (newM.nickname && old.nickname && newM.nickname !== old.nickname) {
            embed.setTitle("Nickname Changed")
            embed.addField("User", newM.user.tag, true)
            embed.addField("New Nickname", newM.nickname)
            embed.addField("Old Nickname", old.nickname)
            return functions.log(embed)
        } else if (!newM.nickname && old.nickname) {
            embed.setTitle("Nickname Reset")
            embed.addField("User", newM.user.tag, true)
            embed.addField("Old Nickname", old.nickname)
            return functions.log(embed)
        } else if (newM.nickname === old.nickname) {
            if (old.roles !== newM.roles) {
                for (index = 0; index < newM.roles.array().length; ++index) {
                    if (newM.roles.array()[index].name !== '@everyone') {
                        if (!newRoles) var newRoles = [newM.roles.array()[index].name]
                        else newRoles.push([newM.roles.array()[index].name]);
                    }
                }
                for (indexx = 0; indexx < old.roles.array().length; ++indexx) {
                    if (old.roles.array()[indexx].name !== '@everyone') {
                        if (!roles) var roles = [old.roles.array()[indexx].name]
                        else roles.push([old.roles.array()[indexx].name]);
                    }
                }
                if (!roles) {
                    if (newRoles.length == 1) {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Role (${newRoles.length})`, newRoles)
                    } else {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Roles Removed")
                        else embed.setTitle("Roles Added")
                        embed.addField(`Roles (${newRoles.length})`, newRoles)
                    }
                } else if (!newRoles) {
                    if (roles.length == 1) {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Role (${roles.length})`, roles)
                    } else {

                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Roles Removed")
                        else embed.setTitle("Roles Added")
                        embed.addField(`Roles (${roles.length})`, roles)
                    }
                } else {
                    if (compare(roles, newRoles).length == 1) {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Role (${compare(roles,newRoles).length})`, compare(roles, newRoles))
                    } else {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Roles (${compare(roles,newRoles).length})`, compare(roles, newRoles))
                    }
                }

                functions.log(embed)
            }
        }

}


function compare(a1, a2) {

    var a = [],
        diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        if (k !== 'remove') diff.push(k);
    }
    return diff;
}