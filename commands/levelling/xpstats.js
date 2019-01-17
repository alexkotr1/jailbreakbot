
function div(number){
    return Math.floor(parseInt(number) / 10)
}
const {
    Command
} = require('discord.js-commando');
const redis = require('async-redis'),
    db = redis.createClient({
        db:2
    });
const config = require('../../config')
const Discord = require('discord.js');
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
        const xp = await db.get('xp_' + member.user.id);
        const db_level = await db.get('level_' + member.user.id);
        const level = db_level ? db_level : 1
        const xp_to_reach = 45 * level * (div(level) + 1)
        const rank = await get_rank(member.user.id)
        var xp_of_previous_levels = 0;
        const numbers_to_add = []
        for (var e = 0;e<level-1;e++){
        numbers_to_add.push(45 * (div(level) + 1))
        }
        numbers_to_add.map(item=>xp_of_previous_levels+=item)
        const has_talked = xp ? true : false
  
        const embed = new Discord.RichEmbed()
        .setTitle("Leveling Statistics -" + member.user.tag)
        .setDescription(`Currently Level ${has_talked ?  level ? level : 1 : 1}`)
        .setTimestamp()
        .addField("Experience Points", `${has_talked ? Math.abs(parseInt(xp - xp_of_previous_levels)) : 0}\/${has_talked ? xp_to_reach : 90} (${has_talked ? xp : 0})`)
        .addField("Rank",`${rank ? rank : message.guild.memberCount}\/${message.guild.memberCount}`)
        .setColor(0xBB098A)
        .setThumbnail(member.user.avatarURL)
        .setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
        message.channel.send({embed}).catch(console.error);
    };
}

async function get_rank(id){
    const keys = await db.keys("xp_*");
    var array = []
    for(var x =0;x<keys.length;x++){
        array.push([keys[x],await db.get(keys[x])])
    }
array.sort(function(a, b) {
    return a[1] - b[1];
}).reverse();
for (var e = 0;e<array.length;e++){
    if (array[e][0].endsWith(id)) return e + 1
}
return undefined
}


