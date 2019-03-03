const config = require("../config"),
      functions = require("../functions/functions").modules,
      { RichEmbed } = require("discord.js")

exports.guildMemberRemove = function(member){
    if (member.guild.id !== config.rjb) return undefined
    const embed = new RichEmbed()
        .setTitle("Member Left")
        .addField("User", member.user.tag + ` (${member})`, true)
        .addField("Created", member.user.createdAt)
        .setThumbnail(member.user.avatarURL)
        .setColor(0x8A2BE2)
        .setFooter(member.user.id)
        .setTimestamp()
        functions.log(embed)
   
}