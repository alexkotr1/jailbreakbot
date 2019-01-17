const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mutechannel',
            group: 'mod utilities',
            memberName: 'mutechannel',
            description: 'Denies send messages and add reactions permissions from everyone.',
            examples: ['!mutechannel']
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id", config.administrator));
    }
	
    run(msg) {
		msg.delete().catch(console.error)
msg.channel.overwritePermissions(msg.guild.defaultRole,{
 'SEND_MESSAGES': false,
'ADD_REACTIONS': false
}).catch(console.error);
};
}
