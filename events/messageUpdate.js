const { RichEmbed } = require("discord.js"),
        config = require("../config"),
        functions = require("../functions/functions").modules,
        detectors = require("../utilities/detectors").modules

exports.messageUpdate = async function(old_message,new_message){
    const channels_to_ignore = [config.admin,config.dev_backroom]
    if (!new_message.guild || new_message.guild.id !== config.rjb || new_message.author.bot || new_message.webhookID || channels_to_ignore.indexOf(new_message.channel.id) > -1) return undefined
    detectors.detect_spoilers(new_message)
    functions.check_for_bad_words_and_invites_and_report(new_message)
        const embed = new RichEmbed()
        .setTitle("Message Updated")
        .addField("User", new_message.author.tag + ` (${new_message.member})`, true)
        .addField("Old Message:", (old_message.content.length < 1024 && old_message.content) ? old_message.content : 'N\/A')
        .addField("New Message:", (new_message.content.length < 1024 && new_message.content) ? new_message.content : 'N\/A')
        .addField("Channel", new_message.channel)
        .setThumbnail(new_message.author.avatarURL)
        .setColor(0x0297DB)
        .setFooter(new_message.author.id)
        .setTimestamp()
        functions.log(embed)
    }
