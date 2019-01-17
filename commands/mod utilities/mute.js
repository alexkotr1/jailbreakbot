const { Command } = require('discord.js-commando', 'discord.js');
const config = require("../../config")
const db = require("../../utilities/db")
const Discord = require('discord.js');
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'mod utilities',
            memberName: 'mute',
            description: 'Mutes a member for the amount of time it was specified\nContributions by @oliver#9880.',
            examples: ['!mute @AlexK#1337 10m spam'],
            args: [
                {
                    key: 'member',
                    prompt: 'Please provide a member to mute.',
                    type: 'member'
                }, 
				{
                    key: 'timer',
                    prompt: 'Please provide the desired duration of the mute',
                    type: 'string',
                },
				{
                    key: 'reason',
                    prompt: 'Please provide reason of the mute',
                    type: 'string',
					default: 'No reason specified'
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("name", "Moderators"));
    }
	
    async run(msg, {member,timer,reason}) {
msg.delete().catch(console.error);
if (member.highestRole.calculatedPosition >= msg.member.highestRole.calculatedPosition) return msg.reply(`You do not have the authority to perform moderation actions on ${member.displayName}`);
const channel = msg.guild.channels.get(config.public_mod_logs);
if (!channel) return msg.reply("You haven't set a mod logging channel!").then(e=>e.delete(3000));
const res = await db.hgetall(`${member.user.id}mutedInfo`).catch(console.error);
if (res) return msg.reply(`${member.user.tag} is already muted.`).catch(console.error);
var time = parseInt(timer.substr(0,timer.length - 1));
const type = timer.replace(time.toString(),"");
var duration = '';
if (type === 's') {
    duration = `${time.toString()} ${time == 1 ? 'second' : 'seconds'}` ; 
    time = time * 1000;
} else if (type === 'm') {
    duration = `${time.toString()} ${time == 1 ? 'minute' : 'minutes'}` ;
    time = time * 60000;
} else if (type === 'h') {
    duration = `${timer.substr(0,timer.length - 1)} ${time == 1 ? 'hour' : 'hours'}` ; 
    time = time * 3600000
} else if (type === 'd') {
    duration = `${time.toString()} ${time == 1 ? 'day' : 'days'}` ;
    time = time * 86400000
} else if (type === 'w') {
    duration = `${time.toString()} ${time == 1 ? 'week' : 'weeks'}`;
    time = time * 604800000 
}
const mutedRole = msg.guild.roles.get(config.muted);
if (!mutedRole) return msg.reply("I couldn't find the mute role").then(e=>e.delete(3000));
member.addRole(mutedRole).then(async ()=>{
    const cases = await db.get("cases").catch(console.error);
    const caseNumber = cases ? parseInt(cases)  + 1 :  0;
    const date_to_unmute = Date.now() + time;
   await db.hmset(`${member.user.id}mutedInfo`,'date_to_unmute',date_to_unmute,'case',caseNumber);
   await db.incr("cases");
    const embed = new Discord.RichEmbed()
  .setTitle(`Member Muted`)
  .setColor(0xE91E63)
  .setFooter(`Case #${caseNumber} | ${member.user.id}`)
  .setTimestamp()
  .addField("Member",`${member.user.tag}(${member})`,true)
  .addField("Mod",msg.author.tag,true)
  .addField("Duration",duration,true)
  .addField("Reason",reason,true)
  .setThumbnail(member.user.avatarURL)
  db.bgsave();
  channel.send({embed}).then(()=>{
    member.user.send(`You have been muted by **${msg.author.tag}** for: ${duration}`).catch(console.error);
  }).catch(console.error);
  msg.client.guilds.get(config.staff_server).channels.get(config.mod_logs).send({embed}).catch(console.error);
}).catch(console.error);


}

};