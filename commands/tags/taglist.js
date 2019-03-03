const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db,
        edit_embed = require("../../functions/functions").modules.edit_embeds,
      { Util, RichEmbed } = require('discord.js')

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
        await message.delete();
        const res = await db.hgetall("tags")
        if (!res) return msg.reply("There are no tags yet");
        const array = Object.keys(res)
        const embeds_array = [];
        const times = Math.floor(array.length / 25)
        for (var e = 0; e <= times; e++) {
            const embed = new RichEmbed()
            .setTitle("Tag list")
            .setColor(0xB1098B)
            .setFooter(`Requested by ${msg.author.username}  |  ${msg.author.id}`)
            .setTimestamp()
            var length = 0;
            for (var i = 0; i < array.length && i < 25; i++) {
                const name = Object.getOwnPropertyNames(res)[e * 25 + i];
                if (name){
                const value = Util.escapeMarkdown(res[name]);
                length += value.length + name.length
                if (length > 6000) break
                if (value.length >= 1024){
                    const values = Util.splitMessage(value,{maxLength:1024})
                    for(var a = 0;a<values.length;a++){
                        if (i < 25){
                        embed.addField(a == 0 ? name : '...',values[a])
                        i++
                        }
                        else break
                    }
                }
                else if (name && value) embed.addField(name, value)
               }
            }
            if (embed.fields.length) embeds_array.push(embed);
        }
        edit_embed(msg,embeds_array)
    };
}



    