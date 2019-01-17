const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const config = require('../../config.json')
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setreqchannel',
            group: 'role request',
            memberName: 'setreqchannel',
            description: 'Sets role request channel.',
			guildOnly: true,
            examples: ['!setreqchannel']
        });    
    }
hasPermission(msg) {
        return (msg.author.id === msg.guild.owner.id || msg.author.id === config.owner);
    }
	
  async run(msg) {
msg.delete().catch(console.error); 
const firmware_fields_length = parseInt(await db.get("firmware_updates_length"))
const jailbreak_fields_length = parseInt(await db.get("jailbreak_updates_length"))
const other_fields_length = parseInt(await db.get("other_updates_length"))
const request_channel = msg.guild.channels.get(config.request_channel)

var firmware_fields = []
var jailbreak_fields = []
var other_fields = []
var embeds = []

for (var e = 0;e<firmware_fields_length;e++){
	firmware_fields.push(await db.hgetall("firmware_fields_" + e.toString()))
}

for (var x = 0;x<jailbreak_fields_length;x++){
	jailbreak_fields.push(await db.hgetall("jailbreak_fields_" + x.toString()))
}

for (var i = 0;i<other_fields_length;i++){
	other_fields.push(await db.hgetall("jailbreak_fields_" + i.toString()))
}

if (firmware_fields.length) embeds.push(embed('Firmware Updates',firmware_fields.map(field=>field.text).join("")))

if (jailbreak_fields_length) embeds.push(embed('Jailbreak Updates',jailbreak_fields.map(field=>field.text).join("")))

if (other_fields.length) embeds.push(embed('Other Updates',other_fields.map(field=>field.text).join("")))

embeds.map(embed=>request_channel.send({embed}))
};
}

function embed(title,text){
	try{
	const embed = new Discord.RichEmbed()
	.addField(title,text)
	.setColor(0x0297DB)
	return embed
	}
	catch(err){
		console.error(err)
	}
}