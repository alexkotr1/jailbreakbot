const { Command } = require('discord.js-commando', 'discord.js');
const config = require("../../config")
const db = require("../../utilities/db")
const Discord = require('discord.js');
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'mod utilities',
            memberName: 'unmute',
            description: 'Unmutes a member.',
            examples: ['!unmute @AlexK#1337'],
            args: [
                {
                    key: 'member',
                    prompt: 'Please provide a member to unmute.',
                    type: 'member'
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id", config.moderator));
    }
	
    async run(msg, {member}) {
msg.delete().catch(console.error);
if (member.highestRole.calculatedPosition >= msg.member.highestRole.calculatedPosition) return msg.reply(`You do not have the authority to perform moderation actions on ${member.displayName}`);
const channel = msg.guild.channels.get(config.public_mod_logs);
if (!channel) return msg.reply("I couldn't find the mod logging channel").then(e=>e.delete(3000)).catch(console.error);
const can_take_action = await db.exists("action_" + member.user.id)
if (can_take_action) return msg.reply("You have to wait 30 seconds till you perform another action on " + member + '.').then(e=>e.delete(3000))
const cases = await db.get("cases").catch(console.error);
const caseNumber = cases ? parseInt(cases) + 1 : 0;
const res = await db.hget(`${member.user.id}mutedInfo`,"case").catch(console.error);
const mutedRole = msg.guild.roles.get(config.muted);
if (!mutedRole) return msg.reply("I couldn't find the mute role").catch(console.error);
if (!res && !member.roles.exists("id",config.muted)){ 
     msg.reply(`${member.user.tag} is not muted`).catch(console.error);
     return undefined
    }
else if (!res && member.roles.exists("id",config.mutedRole))  { 
    member.removeRole(mutedRole).catch(console.error);
    return undefined
}
else {
member.removeRole(mutedRole).then(()=>{
db.del(`${member.user.id}mutedInfo`);
db.incr("cases");
const embed = new Discord.RichEmbed()
  .setTitle(`Member Unmuted`)
  .setColor(0xAD1457)
  .setFooter(`Case #${caseNumber} | ${member.user.id}`)
  .setTimestamp()
  .addField("Member",`${member.user.tag}(${member})`,true)
  .addField("Mod",msg.author.tag,true)
  .setThumbnail(member.user.avatarURL)
  .addField("Original case",res,true)
  db.bgsave();
  msg.client.guilds.get(config.staff_server).channels.get(config.mod_logs).send({embed}).catch(console.error);
  channel.send({embed}).then(()=>{
      member.user.send(`You have been unmuted by ${msg.author.tag}`).catch(console.error);
      db.set("action_" + member.user.id,'1','EX','30')
    })
}).catch(console.error);
}
};
}
