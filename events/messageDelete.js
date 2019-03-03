const db = require("../utilities/db").db,
      config = require("../config"),
      functions = require("../functions/functions").modules,
     { RichEmbed } = require("discord.js")

exports.messageDelete = async function(message){
    if (message.author.bot || !message.guild  || message.webhookID || message.length > 1024 || message.guild.id != config.rjb || message.channel.id  === config.dev_backroom) return undefined
            const pic_path = await db.get("pic_" + message.id);
            const embed = new RichEmbed()
            .setTitle("Message Deleted")
            .addField("User", message.author.tag + ` (${message.author})`, true)
            .addField("Message:", message.content.length ? message.content : 'N\/A')
            .addField("Channel", message.channel)
            .setThumbnail(message.author.avatarURL)
            .setColor(0xff0000)
            .setFooter(message.author.id)
            .setTimestamp()
            if (pic_path) embed.setImage(pic_path)
            functions.log(embed)
            return undefined
}