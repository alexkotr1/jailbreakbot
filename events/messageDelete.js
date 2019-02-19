const db = require("../utilities/db")
const Discord = require("discord.js")
const config = require("../config")
const functions = require("../functions/functions").modules
exports.messageDelete = async function(message){
    if (message.author.bot || !message.guild  || message.webhookID || message.length > 1024 || message.guild.id != config.rjb) return undefined
            const pic_path = await db.get("pic_" + message.id);
            const embed = new Discord.RichEmbed()
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