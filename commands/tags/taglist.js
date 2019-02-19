const {
    Command
} = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")
const { Util, RichEmbed } = require('discord.js')
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'taglist',
            group: 'tags',
            memberName: 'taglist',
            description: 'Posts an embed with all the available tags.',
            examples: ['!taglist']
        });
    }
    hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator)
    }
    async run(msg) {
        msg.delete().catch(console.error);
        const res = await db.hgetall("tags")
        if (!res) return msg.reply("There are no tags yet");
        const array = Object.keys(res)
        const embeds_array = [];
        const times = (array.length / 25) >> 0
        for (var e = 0; e < times + 1; e++) {
            const embed = new RichEmbed()
            embed.setTitle("Tag list")
            embed.setColor(0xB1098B)
            embed.setFooter(`Requested by ${msg.author.username}  |  ${msg.author.id} (Page ${e + 1}/${times + 1})`)
            embed.setTimestamp()
            for (var i = 0; i < array.length && i < 25; i++) {
                const name = Object.getOwnPropertyNames(res)[e * 25 + i];
                const value = Util.escapeMarkdown(res[name]);
                if (value.length >= 1024){
                    const values = Util.splitMessage(value,{maxLength:1024})
                    for(var a = 0;a<values.length;a++){
                        embed.addField(a == 0 ? name : '...',values[a])
                    }
                }
                else if (name && value) embed.addField(name, value)
            }
            if (embed.fields.length > 0) embeds_array.push({embed});
        }
        msg.channel.send(embeds_array[0]).then(async message => {
            db.set(message.id + 'reactions', 0)
            await message.react('⬅');
            await message.react('➡')
            const filter = (reaction, user) => reaction.emoji.name === '➡' && user.id == msg.author.id
            const collector = message.createReactionCollector(filter, {
                time: 120000
            });
            collector.on('collect', async r => {
                const reactors = r.users.array();
                for (var e = 0; e < reactors.length; e++) {
                    if (!reactors[e].bot) {
                        r.remove(reactors[e]);
                    }
                }
                const page = await db.get(r.message.id + 'reactions');
                if (!embeds_array[parseInt(page) + 1]) return undefined
                message.edit(embeds_array[parseInt(page) + 1]).then(() => {
                    db.incr(message.id + 'reactions');
                })
            });
            const filter2 = (reaction, user) => reaction.emoji.name === '⬅' && user.id == msg.author.id
            const collector2 = message.createReactionCollector(filter2, {
                time: 120000
            });
            collector2.on('collect', async r => {
                const reactors = r.users.array();
                for (var e = 0; e < reactors.length; e++) {
                    if (!reactors[e].bot) {
                        r.remove(reactors[e]);
                    }
                }
                const page = await db.get(r.message.id + 'reactions');
                if (!embeds_array[parseInt(page) - 1]) return undefined
                message.edit(embeds_array[parseInt(page) - 1]).then(() => {
                    db.incrby(message.id + 'reactions', -1);
                })
            });
            collector.on('end', () => db.del(message.id + 'reactions'))
        })
    };
}