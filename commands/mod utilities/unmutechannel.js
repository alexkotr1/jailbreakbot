const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmutechannel',
            group: 'mod utilities',
            memberName: 'unmutechannel',
            description: 'Grants everyone permissions to send message and add reactions in the channel the command was executed.',
            examples: ['!unmutechannel']
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id", config.administrator)
    }
	
    run(msg) {
		msg.delete(); 
msg.channel.overwritePermissions(msg.guild.defaultRole,{
 'SEND_MESSAGES': true,
'ADD_REACTIONS': true
}).catch(console.error);

};
}
