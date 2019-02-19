const {
    Command
} = require('discord.js-commando', 'discord.js');
const xp_user = require("../../classes/xp_user").modules
const Discord = require('discord.js');
const config = require("../../config")
const redis = require("async-redis")
const db = redis.createClient({db:2})
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'xptop',
            group: 'levelling',
            memberName: 'xptop',
            description: 'Displays levelling leaders of a server.',
            examples: ['!xptop']
        });
    }
    hasPermission(msg){
        return (msg.channel.id === config.b_commands || msg.member.roles.exists("id",config.moderator)) && msg.guild.id === config.rjb
    }
    async run(message) {
        message.delete().catch(console.error);
        const keys = await db.keys("xp_*");
        var array = []
        for(var x =0;x<keys.length;x++){
            array.push([keys[x],await db.get(keys[x])])
        }
    array.sort(function(a, b) {
        return a[1] - b[1];
    }).reverse()
    array = array.filter(item=>{
        const member = message.guild.members.get(item[0].substring(3,item[0].length))
        if (member) return true
        return false
    }).slice(0,10)
    const embed = new Discord.RichEmbed()
                    .setTitle("Levelling Leaderboard")
                    .setDescription("Levelling Leaders of " + message.guild.name)
                    .setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
                    .setTimestamp()
                    .setColor(0xBD0989)
                    for (var y = 0;(y<array.length && y<10);y++){
                        const id = array[y][0].substring(3,array[y][0].length)
                        const level = await xp_user.get_level(id)
                        embed.addField(`#${y+1} - Level ${level}`,`<@${id}>`)
                        if (y == 0) embed.setThumbnail(message.guild.members.get(id).user.avatarURL)
                }
                message.channel.send({embed});
    };
}



