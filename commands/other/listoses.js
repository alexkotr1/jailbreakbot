const { Command } = require('discord.js-commando');
const getDevices = require("../../utilities/devices");
const Discord = require("discord.js");
const config = require("../../config")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'listoses',
            group: 'other',
            memberName: 'listoses',
            description: 'List all the available OSes for an iOS device.',
			guildOnly: true,
            examples: ['!listoses iphone 6s'],
            args: [
                {
                    key: 'device',
                    prompt: 'Insert an iOS device.',
                    type: 'string',
                }
            ]
        });    
    }
hasPermission(msg){
    return msg.member.roles.exists("id",config.moderator) || msg.channel.id === config.b_commands
}
	
    async run(message,{device}) {	
await message.delete()
const devices = await getDevices()
const index = devices.map(device=>device.name).indexOf(device.toLowerCase().replace(/\s/g,""))
if (index == -1) return message.reply("I couldn't find this device.").then(e=>e.delete(3000))
const embed = new Discord.RichEmbed()
.addField("Available OSes for " + devices[index].orig_name,'• ' + uniq(devices[index].oses).join("\n• "))
.setColor(0xB0098C)
.setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
message.channel.send({embed})
};
}


function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}