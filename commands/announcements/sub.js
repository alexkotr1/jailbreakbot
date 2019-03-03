const { Command } = require('discord.js-commando'),
        config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sub',
            group: 'announcements',
            memberName: 'sub',
            description: 'Announce subreddit news',
            examples: [';sub Hello subreddit users! Today we...'],
		    guildOnly: true,
            args: [
                {
                    key: 'message',
                    prompt: 'Select a message',
                    type: 'string'
                }			
				  ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id", config.sub_mods));
    }
  async run(msg, {message}) {
		msg.delete().catch(console.error);
		const role = msg.guild.roles.get(config.sub_mods);
        role.setMentionable(true).then(()=>
        msg.guild.channels.get(config.subreddit_news_channel).send(`${role}, ${message}`)).catch(console.error)
        .then(()=>role.setMentionable(false))
    }
};