const { Command } = require('discord.js-commando');
const Discord = require("discord.js");
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'listbadwords',
            group: 'reports',
            memberName: 'listbadwords',
            description: 'Lists all bad words.',
			guildOnly: true,
            examples: ['!listbadwords']
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator)
    }

    async run(message) {
        message.delete().catch(console.error);
        const bad_words = await db.hgetall("bad_words");
        const properties = Object.getOwnPropertyNames(bad_words)
        const embed = new Discord.RichEmbed()
        .setTitle("Bad words list")
        .setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
        .setColor(0x00AE86)
        .setDescription("Priority 0: Doesn't ping anyone.\nPriority 1: Pings the Moderators that have choosen to be pinged when they are online.\nPriority 2:Pings Moderators role.")
        const bad_words_arr = properties.filter(item=>bad_words[item] == 0).join("\n")
        const priority_bad_words = properties.filter(item=>bad_words[item] == 1).join("\n")
        const top_priority_bad_words = properties.filter(item=>bad_words[item] == 2).join("\n")
        if (bad_words_arr.length) embed.addField("Priority 0:",`${bad_words_arr}`)
        if (priority_bad_words.length) embed.addField("Priority 1:",`${priority_bad_words}`)
        if (top_priority_bad_words.length) embed.addField("Priority 2:",`${top_priority_bad_words}`)

        return message.author.send({embed}).catch(()=>message.channel.send({embed}))
        
    }
};