const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db,
      { RichEmbed } = require("discord.js");

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'case',
            group: 'mod utilities',
            memberName: 'case',
            description: 'Posts information about a specific case.',
            guildOnly: true,
            examples: ['!case 12'],
            args: [{
                key: 'case_number',
                prompt: 'Enter case\'s ID.',
                type: 'integer',
            }]
        });
    }
    hasPermission(message) {
        return message.member.roles.exists("id", config.moderator)
    }
    async run(message, {case_number}) {
        await message.delete();
        const db_data = await db.hget("cases_details", case_number.toString())
        if (!db_data) return message.reply(`I couldn't find information for the case \`\`${case_number}\`\`.`).then(e=>e.delete(3000))
        const punishment = JSON.parse(db_data)
        const embed = new RichEmbed()
        .setColor(0xFFFFFF)
        .setTitle(`Case ${case_number} lookup`)
        .addField('User',`<@${punishment.user}> (${punishment.user})`)
        .addField('Mod',`<@${punishment.mod}> (${punishment.mod})`)
        .addField('Type',punishment.type)
        .setTimestamp(new Date(punishment.date))
        if (punishment.type !== 'kick') embed.addField((punishment.type === 'warn' || punishment.type === 'lift-warn') ? 'Points' : (punishment.type === 'ban' || punishment.type === 'mute') ? 'Duration' : 'Original Case',punishment.punishment_variable)
        if (punishment.type !== 'unmute') embed.addField('Reason',punishment.reason)
        message.channel.send({embed});
    }
}