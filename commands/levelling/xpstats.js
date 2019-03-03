const { Command } = require('discord.js-commando'),
        config = require('../../config'),
        Discord = require('discord.js'),
        xp_user = require("../../classes/xp_user").modules
        
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'xpstats',
            group: 'levelling',
            memberName: 'xpstats',
            description: 'Displays experience points of given member.',
            examples: ['!xpstats'],
            args: [{
                key: 'mem',
                prompt: 'Please provide a member',
                type: 'member',
                default: ''
            }]
        });
    }
hasPermission(msg){
    return (msg.channel.id === config.b_commands || msg.member.roles.exists("id",config.moderator)) && msg.guild.id === config.rjb
}
    async run(message, {mem}) {
        message.delete().catch(console.error);
        const member = mem ? mem : message.member
        const user = await new xp_user(member.user.id)
        const rank = await xp_user.get_rank(member.user.id,message.guild)
        const embed = new Discord.RichEmbed()
        .setTitle("Leveling Statistics - " + member.user.tag)
        .setDescription(`Currently Level ${user.level}`)
        .setTimestamp()
        .addField("Experience Points", `${user.bef}\/${user.xp_to_rshow} (${user.total})`)
        .addField("Rank",`${rank ? rank : message.guild.memberCount}\/${message.guild.memberCount}`)
        .setColor(0xBB098A)
        .setThumbnail(member.user.avatarURL)
        .setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
        message.channel.send({embed}).catch(console.error);
    };
}




