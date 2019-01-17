const { Command } = require('discord.js-commando', 'discord.js');
const config = require("../../config")
const db = require("../../utilities/db")
const Discord = require('discord.js');
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'mod utilities',
            memberName: 'warn',
            description: 'Warns a member with a specific amount of points.',
            examples: ['!warn @AlexK#1337 100 piracy'],
            args: [
                {
                    key: 'member',
                    prompt: 'Provide a member to warn',
                    type: 'member'
                }, 
				{
                    key: 'points',
                    prompt: 'Provide the desired amount of points for the warn',
                    type: 'integer',
                },
				{
                    key: 'reason',
                    prompt: 'Provide reason of the warn',
                    type: 'string',
					default: 'No reason specified'
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator);
    }
	
   async run(msg, {member,points,reason}) {
msg.delete().catch(console.error);
if (member.highestRole.calculatedPosition >= msg.member.highestRole.calculatedPosition) return msg.reply(`You do not have the authority to perform moderation actions on ${member.displayName}`);
const modlog = msg.guild.channels.get(config.public_mod_logs);
if (!modlog) return msg.reply("You haven't set a mod logging channel!").then(e=>e.delete(3000));
const points_before_warn = parseInt(await db.hget("warnpoints",member.user.id));
if (points_before_warn + points >= 400){
    if (points_before_warn + points >= 600) {
        member.ban({days: 7,reason:"Exceeded warn points limit."}).then(async ()=>{
           await db.hdel("warnpoints",member.user.id)
        })
    }
  else {
      member.kick().catch(console.error);
     await db.hincrby("warnpoints",member.user.id,points).catch(console.error);
  }
}
else db.hincrby("warnpoints",member.user.id,points).catch(console.error);
const caseNumber = await db.get("cases").catch(console.error);
db.incr("cases").then(()=>{
const embed = new Discord.RichEmbed()
  .setTitle(`Member Warned`)
  .setColor(0xffa500)
  .setFooter(`Case #${caseNumber ? caseNumber : 0} | ${member.user.id}`)
  .setTimestamp()
  .addField("Member",`${member.user.tag}(${member})`,true)
  .addField("Mod",msg.author.tag,true)
  .addField("Increase",`${points} Points`,true)
  .addField("Reason",reason,true)
  .setThumbnail(member.user.avatarURL)
  msg.client.guilds.get(config.staff_server).channels.get(config.staff_mod_logs).send({embed}).catch(console.error);
   modlog.send({embed}).catch(console.error);
   db.bgsave();
});
}
};
