const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db,
        edit_embeds = require("../../functions/functions").modules.edit_embeds,
      { RichEmbed, Util, GuildMember } = require("discord.js")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cases',
            group: 'mod utilities',
            memberName: 'cases',
            description: 'Posts information about given mod\'s cases.',
            guildOnly: true,
            examples: ['!modcases @AlexK#1337'],
            args: [{
                    key: 'mod',
                    prompt: 'Enter a member.',
                    type: 'member'

                },
                {
                    key: 'is_mod',
                    prompt: 'Do you want user or mod cases of given member? (Yes for mod, no for user cases)',
                    type: 'boolean'

                },
                {
                    key: 'thorough_option',
                    prompt: 'Would you like detailed embeds?',
                    type: 'boolean'
                },
                {
                    key: 'filter',
                    prompt: 'Filter cases.',
                    type: 'member|string',
                    default: '',
                    validate: key=>{
                        if (key instanceof GuildMember) return true
                        key = key.toLowerCase()
                        const types = ['warn','ban','lift-warn','mute','unmute']
                        return types.indexOf(key) > -1
                    }
                }
            ]
        });
    }
    hasPermission(msg) {
        return msg.member.roles.exists("id", config.administrator)
    }
    async run(message, { mod, is_mod, thorough_option, filter }) {
        await message.delete();
        const db_data = await db.hgetall("cases_details")
        if (!db_data) return message.reply("I couldn't find any information.").then(e => e.delete(3000))
        var matched = Object.values(db_data).map(data => JSON.parse(data)).filter(data =>data[is_mod == true ? 'mod' : 'user'] === mod.user.id);
        if (filter) {
            matched = matched.filter(punishment=>{
             if (filter instanceof GuildMember) return punishment.user.id === filter.user.id
             else return punishment.type.toLowerCase() === filter.toLowerCase()
        })
    }
    if (!matched.length) return message.reply("I couldn't find any cases.").then(e=>e.delete(3000))
        const embeds_array = []
        if (thorough_option) {
            matched.map(punishment => {
                const embed = new RichEmbed()
                    .setColor(0xFFFFFF)
                    .setTitle(`Case ${punishment.case_number} lookup`)
                    .addField('User', `<@${punishment.user}> (${punishment.user})`)
                    .addField('Type', punishment.type)
                    .setTimestamp(new Date(punishment.date))
                if (punishment.type !== 'kick') embed.addField((punishment.type === 'warn' || punishment.type === 'lift-warn') ? 'Points' : (punishment.type === 'ban' || punishment.type === 'mute') ? 'Duration' : 'Original Case', punishment.punishment_variable)
                if (punishment.type !== 'unmute') embed.addField('Reason', punishment.reason)
                embeds_array.push(embed)
            })
            return edit_embeds(message, embeds_array)
        }
        const array = matched.map(punishment=>{
            return is_mod == true ? `Case#${punishment.case_number}: ${punishment.type} - <@${punishment.user}>` : `Case#${punishment.case_number}: ${punishment.type}`
        })
        const string = array.join("\n")
        const pieces = Util.splitMessage(string,{maxLength : 1024})
        const name = `Cases of ${mod.user.tag}`
        if (Array.isArray(pieces)) pieces.map(piece=>embeds_array.push(embedBuilder(message,name,piece)))
        else embeds_array.push(embedBuilder(message,name,pieces))
        edit_embeds(message,embeds_array)
    }
}


function embedBuilder(message,name,value){
const embed = new RichEmbed()
.setColor(0x8A2BE2)
.setFooter("Requested by " + message.author.tag)
.addField(name,value)
return embed
}

