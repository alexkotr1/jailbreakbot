const {
    Command
} = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warnpoints',
            group: 'mod utilities',
            memberName: 'warnpoints',
            description: 'Displays the amount of warn points given member has.',
            examples: ['!warnpoints @AlexK#1337'],
            args: [{
                key: 'member',
                prompt: 'Please provide a member',
                type: 'member',
                default: ''
            }]
        });
    }

    async run(msg, {member}) {
        msg.delete().catch(console.error);
        if (!member || member == '') member = msg.member
        if (!msg.member.roles.exists("id", config.moderator) && (msg.author.id !== member.user.id || msg.channel.id !== config.b_commands)) return msg.author.send("You do not have permission to perform this action.");
        const points = await db.hget("warnpoints", member.user.id);
        return msg.reply(`${member.user.tag} has **${points ? points : 0}** warning points.`).then(e => e.delete(5000));
    };
}