const { Command } = require('discord.js-commando');
const getDevices = require("../../utilities/devices");
const config = require("../../config");
const db = require("../../utilities/db")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'adddevice',
            group: 'other',
            memberName: 'adddevice',
            description: 'Adds the device and iOS specified in the nickname',
			guildOnly: true,
            examples: ['!adddevice "iPhone 6s" 10.2'],
            args: [
                {
                    key: 'device',
                    prompt: 'Insert an iOS device',
                    type: 'string',
                },
				{
                    key: 'ios',
                    prompt: 'Which the iOS version of your device.',
                    type: 'string',
                }
            ]
        });    
    }
    hasPermission(msg){
        return msg.member.roles.exists("id",config.moderator) || msg.channel.id === config.b_commands
    }
	
    async run(message, {device,ios}) {	
await message.delete();
const devices = await getDevices()
const index = devices.map(device=>device.name).indexOf(device.toLowerCase().replace(/\s/g,""))
if (index == -1) return message.reply("I couldn't find this device. Did you forget to include quotes?").then(e=>e.delete(3000))
else if (devices[index].oses.indexOf(ios) == -1) return message.reply("This device is not compatible with the iOS version you provided.").then(e=>e.delete(3000))
const nickname = message.member.displayName.replace(/\[.*\]/g,"").trim() + ` [${devices.map(device=>device.orig_name)[index]}, ${ios}]`
if (nickname.length > 32) return message.reply("The nickname can't have more than 32 characters.").then(e=>e.delete(3000))
message.member.setNickname(nickname).then(async ()=>{
    message.reply("Successfully added your device in your nickname.").then(e=>e.delete(3000))
    await db.hmset("device_" + message.author.id,"name", devices.map(device=>device.orig_name)[index], "ios", ios)
}).catch(()=>message.reply('I don\'t have permission to change your nickname!').then(e=>e.delete(3000)))

};
}


