const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")
const Discord = require('discord.js');

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'liftwarn',
            group: 'mod utilities',
            memberName: 'liftwarn',
            description: 'Removes the amount of warning points it was specified from a member.',
            examples: ['!liftwarn @AlexK#1337 100 resolved the situation'],
            args: [
                {
                    key: 'member',
                    prompt: 'Please provide a member to de-warn',
                    type: 'member'
                }, 
				{
                    key: 'points',
                    prompt: 'Please provide amount of points to de-warn',
                    type: 'integer',
                },
				{
                    key: 'reason',
                    prompt: 'Please provide a reason for the de-warn',
                    type: 'string',
					default: 'No reason specified'
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id", config.moderator));
    }
	
    async run(msg, {member,points,reason}) {
msg.delete().catch(console.error);
if (member.highestRole.calculatedPosition >= msg.member.highestRole.calculatedPosition) return msg.reply(`You do not have the authority to perform moderation actions on ${member.displayName}`);
const channel = msg.guild.channels.get(config.public_mod_logs);
if (!channel) return msg.reply("You haven't set a mod logging channel!").then(e=>e.delete(3000));
const points_before_warn = parseInt(await db.hget("warnpoints",member.user.id));
if (points_before_warn - points <= 0) db.hdel("warnpoints",member.user.id)
else db.hincrby('warnpoints',member.user.id,`-${points}`)
const caseNumber = await db.get("cases")
db.incr("cases").then(()=>{
const embed = new Discord.RichEmbed()
  .setTitle(`Member De-Warned`)
  .setColor(0xA84300)
  .setFooter(`Case #${caseNumber ? caseNumber : 0} | ${member.user.id}`)
  .setTimestamp()
  .addField("Member",`${member.user.tag}(${member})`,true)
  .addBlankField(true)
  .addField("Mod",msg.author.tag,true)
  .addField("Decrease",`${points} Points`,true)
  .addField("Reason",reason)
  .setThumbnail(member.user.avatarURL)
  db.bgsave()
  modlog.send({embed}).then(()=>{
      member.user.send(`You have been de-warned by ${msg.author.tag} for: ${reason}`).catch(console.error);
      msg.client.guilds.get(config.staff_server).channels.get(config.staff_mod_logs).send({embed}).catch(console.error);
  })

});
};
}


