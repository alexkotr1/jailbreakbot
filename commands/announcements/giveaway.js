const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'giveaway',
            group: 'announcements',
            memberName: 'giveaway',
            description: 'Announce giveaways.',
			guildOnly: true,
            examples: ['!giveaway.']
        });    
    }
hasPermission(message) {
        return message.member.roles.exists("id", config.administrator);
    }
    async run(message) {
        const giveaways = {
            role : message.guild.roles.get(config.giveaways_role),
            channel : message.guild.channels.get(config.giveaways_channel)
        }    
        giveaways.role.setMentionable(true).then(()=>{
            giveaways.channel.send(`${role} NEW GIVEAWAY`)
        }).then(()=>{
            giveaways.role.setMentionable(false)
        })
		}
		};
		
   