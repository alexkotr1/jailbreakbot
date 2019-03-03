const { Command } = require('discord.js-commando'),
        config = require("../../config");
        
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removedevice',
            group: 'other',
            memberName: 'removedevice',
            description: 'Removes the device from the nickname.',
			guildOnly: true,
            examples: ['!removedevice']
        });    
    }
    hasPermission(msg){
        return msg.member.roles.exists("id",config.moderator) || msg.channel.id === config.b_commands
    }
	
    async run(message) {	
await message.delete();
await message.member.setNickname(message.member.displayName.replace(/\[.*\]/g,""))
message.reply("Successfully removed the device from your nickname.").then(e=>e.delete(3000))

};
}


