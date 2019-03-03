const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'mod utilities',
            memberName: 'purge',
            description: 'Bulk deletes messages of the channel the command was executed.',
            examples: ['!purge 99'],
            args: [{
                key: 'number',
                prompt: 'How many messages do you want to delete?',
                type: 'integer',

            }]
        });
    }
    hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator) 
    }
    async run(msg, {number}) {
            await msg.delete()
            if (number > 100) return msg.reply("Value should be less than or equal to 100");
            if (number == 1) return msg.reply("``purge`` can only be used to delete 2 or more messages");
            const fetched = await msg.channel.fetchMessages({
                limit: number
            });
            if (!fetched) return msg.reply("I couldn't find any messages.")
                const data = await db.hgetall("ping_preferences_options")
                if (data) await msg.channel.bulkDelete(fetched.filter(item=>item.id !== data.message))
                else await msg.channel.bulkDelete(fetched)
            msg.reply(`Successfully deleted ${fetched.size} messages`).then(e => e.delete(3000))
    }

};