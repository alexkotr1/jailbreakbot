const { Command } = require('discord.js-commando');
const getDevices = require("../../utilities/devices");
const Discord = require("discord.js");
const config = require("../../config");
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'listdevices',
            group: 'other',
            memberName: 'listdevices',
            description: 'List all the available devices.',
			guildOnly: true,
            examples: ['!listdevices']
        });    
    }
    hasPermission(msg){
        return msg.member.roles.exists("id",config.moderator) || msg.channel.id === config.b_commands
    }
	
    async run(message) {	
await message.delete()
const devices = await getDevices()
const embed = new Discord.RichEmbed()
.addField("Available Devices",'• ' + uniq(devices.map(device=>device.orig_name)).join("\n• "))
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