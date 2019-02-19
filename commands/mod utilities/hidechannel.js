const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'hidechannel',
            group: 'mod utilities',
            memberName: 'hidechannel',
            description: 'Denies read messages permissions from everyone.',
            examples: ['!mutechannel'],
            args: [{
                key: 'member',
                prompt: 'Insert a member to mute.',
                type: 'member',
                default: ''

            }]
        });    
    }
hasPermission(msg) { 
        return msg.member.roles.exists("id", config.administrator || msg.author.id === config.owner);
    }
	
async run(msg,{member}) {
await msg.delete().catch(console.error)
if (!member || member === '') member = msg.guild.defaultRole
msg.channel.overwritePermissions(member,{
 'READ_MESSAGES': false
}).catch(console.error);
};
}
