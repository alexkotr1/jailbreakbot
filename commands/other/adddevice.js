const { Command } = require('discord.js-commando', 'discord.js');
const db = require('quick.db')

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'adddevice',
            group: 'other',
            memberName: 'adddevice',
            description: 'Adds the device and iOS specified in the nickname',
			guildOnly: true,
            examples: [';adddevice iPhone 6s 10.2'],
            args: [
                {
                    key: 'device',
                    prompt: 'Which model do you want to add in your nickname?',
                    type: 'string',
					default: ''
                },
				{
                    key: 'spec',
                    prompt: 'Which device do you want to add in your nickname?',
                    type: 'string',
					default: ''				
                },
				{
                    key: 'ios',
                    prompt: 'Which iOS is your device on?',
                    type: 'string',
					default: ''
                }
				,
				{
                    key: 'jic',
                    prompt: 'Which iOS is your device on?',
                    type: 'string',
					default: ''
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.channel.name === 'bot-commands' || msg.member.roles.exists("name","Moderators"));
    }
	
    run(msg, {device,spec,ios,jic}) {	
	msg.delete().catch(console.error); 
if (device == '' || spec == '' || ios == '') return msg.reply("Wrong command usage.\nHere is an example to help you: ```!adddevice iphone 7 11.3.1```");
if (!ios.includes('.') && !spec.includes('mini') && !spec.includes('air')) return msg.reply("Invalid iOS Version");
if (device.toLowerCase() === 'iphone' || device.toLowerCase() === 'ipad' || device.toLowerCase() === 'ipod' || device.toLowerCase() === 'apple tv' || device.toLowerCase() === 'atv' || device.toLowerCase() === 'appletv'){
if (device.toLowerCase() === 'iphone'){
db.fetch("ip" + spec.toLowerCase()).then(i=>{
if (!i) return msg.reply("Unknown device");
if (spec === 'x') spec = 'X';
if (spec.toLowerCase() === '3gs')  spec === '3GS'
if (spec.toLowerCase() === 'se') spec = 'SE';
if (i.indexOf(ios) > -1){
const nick = msg.author.username +` [iPhone ${spec}, ${ios}]`;
if (nick.length >= 32) return msg.reply("Nickname too long! Ask a staff member to change it for you.");
msg.member.setNickname(nick).catch(console.error);
return msg.reply("Successfully added your device in your nickname!").then(e=>e.delete(3000)).catch(console.error);
}
else return msg.reply("Unknown device").then(e=>e.delete(3000)).catch(console.error);
});

}
else if (device.toLowerCase() === 'ipad'){
db.fetch(`ipad${(spec.toLowerCase().includes("mini") || spec.toLowerCase().includes("air")) ? spec.toLowerCase() + ios : spec.toLowerCase()}`).then(i=>{
if (!i) return msg.reply("Unknown device.").then(e=>e.delete(3000));
const specs = (spec.toLowerCase().includes("mini") || spec.toLowerCase().includes("air")) ? spec.toLowerCase() + ios : spec.toLowerCase();
if (specs === 'air2') spec = 'Air 2'
else if (specs === 'air') spec = 'Air'
else if (specs === 'mini') spec = 'Mini'
else if (specs === 'mini2') spec = 'Mini 2'
else if (specs === 'mini3') spec = 'Mini 3'
else if (specs === 'mini4') spec = 'Mini 4'

if (i.indexOf((spec.toLowerCase().includes("mini") || spec.toLowerCase().includes("air")) ? jic : ios) > -1) {
if (spec.toLowerCase().includes("mini") || spec.toLowerCase().includes("air")){
const nick = `${msg.author.username} [iPad ${spec}, ${jic}]`;
if (nick.length >= 32) return msg.reply("Nickname too long! Ask a staff member to change it for you.").then(e=>e.delete(3000)).catch(console.error);
return msg.member.setNickname(nick).catch(console.error);
}
const nick = `${msg.author.username} [iPad ${spec}, ${ios}]`;
if (nick.length >= 32) return msg.reply("Nickname too long! Ask a staff member to change it for you.").then(e=>e.delete(3000)).catch(console.error);
return msg.member.setNickname(nick).catch(console.error);

}
else return msg.reply("Unknown device").then(e=>e.delete(3000)).catch(console.error);
});
}
else if (device.toLowerCase() === 'apple tv' || device.toLowerCase() === 'atv' || device.toLowerCase() === 'appletv'){
const nick = msg.author.username +` [Apple TV ${spec}, ${ios}]`;
if (nick.length >= 32) return msg.reply("Nickname too long! Ask a staff member to change it for you.");
db.fetch('atv'+spec.toLowerCase()).then(arr =>{
if (!arr) return msg.reply("Unknown device").then(e=>e.delete(3000));
if (arr.indexOf(ios) > -1){
if (spec === '2g') spec = '2G';
if (spec === '4k') spec = '4K';
msg.member.setNickname(`${msg.author.username} [AppleTV ${spec}, ${ios}]`).catch(console.error);
return msg.reply("Successfully added your device in your nickname!").then(e=>e.delete(3000)).catch(console.error);
}
else return msg.reply("Unknown device").then(e=>e.delete(3000));
});
}
else if (device.toLowerCase() === 'ipod'){
const nick = msg.author.username +` [iPod ${spec}, ${ios}]`;
if (nick.length >= 32) return msg.reply("Nickname too long! Ask a staff member to change it for you.");
db.fetch('ipod'+spec.toLowerCase()).then(i=>{
if (!i) return msg.reply("Unknown device").then(e=>e.delete(3000)).catch(console.error);
if (i.indexOf(ios) > -1){
if (spec === '2g') spec = '2G';
msg.member.setNickname(`${msg.author.username} [iPod ${spec}, ${ios}]`).catch(console.error);
return msg.reply("Successfully added your device in your nickname!").then(e=>e.delete(3000));
}
else return msg.reply("Unknown device").then(e=>e.delete(3000)).catch(console.error);

});
}
else return msg.reply("Unknown device").then(e=>e.delete(3000)).catch(console.error);
}	
};
}
