const {
    Command
} = require('discord.js-commando');
const Discord = require('discord.js');
const config = require("../../config")
const db = require("../../utilities/db")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'mod utilities',
            memberName: 'ban',
            description: 'Bans the given member permanently.',
            examples: ['!ban @AlexK#1337 NSFW'],
            args: [{
                    key: 'member',
                    prompt: 'Please provide a member to ban',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'Provide the reason of the ban.',
                    type: 'string',
                    default: 'No reason specified'
                }
            ]
        });
    }
    hasPermission(msg) {
        return (msg.member.roles.exists("id", config.moderator));
    }

    async run(msg, {member,reason}){
        msg.delete().catch(console.error);
if (member.highestRole.calculatedPosition >= msg.member.highestRole.calculatedPosition) return msg.reply(`You do not have the authority to perform moderation actions on ${member.displayName}`);
const modlog = msg.guild.channels.get(config.public_mod_logs);
if (!modlog) return msg.reply("You haven't set a mod logging channel!").then(e=>e.delete(3000));
if (!member.bannable) return msg.reply("I don't have the permission to perform this action.").catch(console.error);
const caseNumber = await db.get("cases");
db.incr("cases").then(()=>{
member.ban({days: 7,reason: reason}).then(()=>{
    const embed = new Discord.RichEmbed()
    .setTitle(`Member Banned`)
    .setColor(0x3498DB)
    .setFooter(`Case #${caseNumber ? caseNumber : 0} | ${member.user.id}`)
    .setTimestamp()
    .addField("Member", `${member.user.tag}(${member})`, true)
    .addField("Mod", msg.author.tag, true)
    .addField("Duration", "Permanently", true)
    .setThumbnail(member.user.avatarURL)
    .addField("Reason", reason)
    modlog.send({embed}).catch(console.error);
    msg.client.guilds.get(config.staff_server).channels.get(config.staff_mod_logs).send({embed}).catch(console.error);
    member.user.send(`You have been banned from ${msg.guild.name} for the following reason : ${reason}\nIf you feel you were banned wrongfully, you can send a modmail at https://www.reddit.com/message/compose?to=%2Fr%2Fjailbreak .`);
}).catch(console.error);
})
           

    };
}
