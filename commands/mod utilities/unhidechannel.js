const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unhidechannel',
            group: 'mod utilities',
            memberName: 'unhidechannel',
            description: 'Grants everyone permissions read messages and add reactions in the channel the command was executed.',
            examples: ['!unmutechannel'],
            args: [{
                key: 'member',
                prompt: 'Insert a member to unmute.',
                type: 'member',
                default: ''
            }]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id", config.administrator || msg.author.id === config.owner)
    }
	
async run(msg,{member}) {
await msg.delete(); 
if (!member || member === '') member = msg.guild.defaultRole
msg.channel.overwritePermissions(member,{
 'READ_MESSAGES': null
}).catch(console.error);

};
}
