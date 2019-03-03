const { Command } = require('discord.js-commando'),
        config = require('../../config.json'),
        db = require("../../utilities/db").db,
		apply = require("../../utilities/request_a_role"),
		{ RichEmbed } = require("discord.js")

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
await message.delete();
const staff_server = msg.client.guilds.get(config.staff_server)
const firmware_fields_length = parseInt(await db.get("firmware_updates_length"))
const jailbreak_fields_length = parseInt(await db.get("jailbreak_updates_length"))
const other_fields_length = parseInt(await db.get("other_updates_length"))
const request_channel = msg.guild.channels.get(config.request_channel)

var firmware_fields = []
var jailbreak_fields = []
var other_fields = []
var embeds = []

for (var e = 0;e<firmware_fields_length;e++){
	firmware_fields.push(await db.hgetall("firmware_updates" + e.toString()))
}

for (var x = 0;x<jailbreak_fields_length;x++){
	jailbreak_fields.push(await db.hgetall("jailbreak_updates" + x.toString()))
}

for (var i = 0;i<other_fields_length;i++){
	other_fields.push(await db.hgetall("other_updates" + i.toString()))
}
const emojis = {
	jb_emojis : jailbreak_fields.map(field=>staff_server.emojis.get(field.emoji)),
	firmware_emojis : firmware_fields.map(field=>staff_server.emojis.get(field.emoji)),
	other_emojis : other_fields.map(field=>staff_server.emojis.get(field.emoji))
}
if (firmware_fields.length) embeds.push(embed('Firmware Updates',firmware_fields.map(field=>field.text.replace("<emoji>",`${staff_server.emojis.get(field.emoji)}`)).join("\n\n")))

if (jailbreak_fields_length) embeds.push(embed('Jailbreak Updates',jailbreak_fields.map(field=>field.text.replace("<emoji>",`${staff_server.emojis.get(field.emoji)}`)).join("\n\n")))

if (other_fields.length) embeds.push(embed('Other Updates',other_fields.map(field=>field.text.replace("<emoji>",`${staff_server.emojis.get(field.emoji)}`)).join("\n\n")))

embeds.map(embed=>request_channel.send({embed}).then(message=>{
	const embeds_type = message.embeds[0].fields[0].name.startsWith("Jailbreak Updates") ? 'jb' : message.embeds[0].fields[0].name.startsWith("Firmware Updates") ? 'firmware' : 'other'
	if (embeds_type === 'jb') emojis.jb_emojis.map(async emoji=>await message.react(emoji))
	else if (embeds_type === 'firmware') emojis.firmware_emojis.map(async emoji=>await message.react(emoji))
	else if (embeds_type === 'other') emojis.other_emojis.map(async emoji=>await message.react(emoji))
}))
setTimeout(function(){
apply(msg.client)
},5000)
};
}

function embed(title,text){
	try{
	const embed = new RichEmbed()
	.addField(title,text)
	.setColor(0x0297DB)
	return embed
	}
	catch(err){
		console.error(err)
	}
}