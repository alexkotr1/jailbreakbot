const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")
const Discord = require('discord.js');

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'mod utilities',
            memberName: 'kick',
            description: 'Kicks the given member.',
            examples: ['!kick @AlexK#1337 alt account'],
            args: [
                {
                    key: 'member',
                    prompt: 'Provide a member to kick',
                    type: 'member'
                }, 
				{
                    key: 'reason',
                    prompt: 'Provide reason of the kick',
                    type: 'string',
					default: 'No reason specified'
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator);
    }
	
    async run(msg, {member,reason}) {
msg.delete().catch(console.error);
if (member.highestRole.calculatedPosition >= msg.member.highestRole.calculatedPosition) return msg.reply(`You do not have the authority to perform moderation actions on ${member.displayName}`);
const res2 = await db.get("cases");
if (!res) return msg.reply("You have to set a mod logging channel first.").then(e=>e.delete(3000));
const modlog = msg.guild.channels.get(config.public_mod_logs);
if (!modlog) return msg.reply("You haven't set a mod logging channel!").then(e=>e.delete(3000));if (!modlog) return msg.reply("I couldn't find the mod logging channel.").then(e=>e.delete(10000));
const can_take_action = await db.exists("action_" + member.user.id)
if (can_take_action) return msg.reply("You have to wait 30 seconds till you perform another action on " + member + '.').then(e=>e.delete(3000))
if (!member.kickable) return msg.reply("I don't have enough permissions to perform this action.").then(e=>e.delete(10000));
member.user.send(`You have been kicked from ${msg.guild.name} for the following reason: ${reason}`).catch(console.error).then(()=>{
member.kick(reason).then(()=>{
db.incr("cases").then(()=>{
const embed = new Discord.RichEmbed()
  .setTitle(`Member Kicked`)
  .setColor(0x00AE86)
  .setFooter(`Case #${res2 ? res2 : 0} | ${member.user.id}`)
  .setTimestamp()
  .addField("Member",`${member.user.tag}(${member})`,true)
  .addField("Mod",msg.author.tag,true)
  .setThumbnail(member.user.avatarURL)
  embed.addField("Reason",reason);
   modlog.send({embed}).catch(console.error);
   msg.client.guilds.get(config.staff_server).channels.get(config.staff_mod_logs).send({embed}).catch(console.error);
   db.set("action_" + member.user.id,'1','EX','30')
}).catch(console.error);
}).catch(console.error);
}).catch(console.error);	

  db.bgsave();

};
}
