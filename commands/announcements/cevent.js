const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cevent',
            group: 'announcements',
            memberName: 'cevent',
            description: 'Announce community events',
            examples: ['!cevent Hello,...'],
			guildOnly: true,
            args: [
				{
                    key: 'text',
                    prompt: 'What would you like the bot to say?',
                    type: 'string'
                }
            ]
        });
    }
hasPermission(message) {
        return (message.member.roles.exists("id", config.administrator) || message.author.id == config.owner || message.member.roles.exists("id",config.event_manager));
    }
	
	run(message,{text}) {
        message.delete().catch(console.error)
        const channel = message.guild.channels.get(config.events_channel)
        const role = message.guild.roles.get(config.events_role)
        role.setMentionable(true).then(()=>{
            channel.send(`${role} ${text}`).then(()=>{
                role.setMentionable(false)
            }).catch(console.error)
        })
        return undefined
	}
};

    


