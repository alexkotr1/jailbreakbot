const config = require("../config"),
      functions = require("../functions/functions").modules,
      db = require("../utilities/db").db,
    { RichEmbed } = require("discord.js")

exports.guildMemberAdd = async function(member){
    if (member.guild.id !== config.rjb) return undefined
    const embed = new RichEmbed()
        .setTitle("User Joined")
        .addField("User", member.user.tag + `(${member})`, true)
        .addField("Created", member.user.createdAt)
        .setThumbnail(member.user.avatarURL)
        .setColor(0x00FF7F)
        .setFooter(member.user.id)
        .setTimestamp()
        functions.log(embed)
    const exists = await db.exists(`${member.user.id}mutedInfo`)
	if (exists) {
		member.addRole(member.guild.roles.get(config.muted)).catch(console.error)
		const reports_channel = member.guild.channels.get(config.report_logs)
		if (!reports_channel) return undefined
		reports_channel.send(`${member} just tried to mute evade!`).catch(console.error)
	}
}