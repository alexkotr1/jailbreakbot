const { CommandoClient } = require('discord.js-commando');
const Commando = require('discord.js-commando');
const path = require('path');
const Snooper = require('reddit-snooper');
const config = require("./config.json");
const sqlite = require('sqlite');
const snooper = new Snooper({
    automatic_retries: true, 
    api_requests_per_minuite: 60 
})

const client = new CommandoClient({
    commandPrefix: '!',
    unknownCommandResponse: false,
    owner: config.owner,
    disableEveryone: true,
    commandEditableDuration: 30,
    nonCommandEditable: true,
    autoReconnect: true
});
exports.modules = {
    get client(){
        return client
    }
}
const events = {
    ready : require("./events/ready.js").ready,
    error : require("./events/error.js").error,
    message : require("./events/message.js").message,
    messageUpdate : require("./events/messageUpdate.js").messageUpdate,
    messageDelete : require("./events/messageDelete.js").messageDelete,
    guildMemberAdd : require("./events/guildMemberAdd.js").guildMemberAdd,
    guildMemberRemove : require("./events/guildMemberRemove.js").guildMemberRemove,
    guildMemberUpdate : require("./events/guildMemberUpdate.js").guildMemberUpdate,

}
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['role request', 'Role request'],
        ['announcements', 'Announcer'],
        ['reports', 'Filtering'],
        ['mod utilities', 'Mod Utilities'],
        ['tags', 'Tags'],
        ['other', 'Other'],
        ['memes', 'Memes'],
        ['levelling', 'Levelling'],
        ['music','Music Player']

    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        ping: true,
        help: true,
        eval: false
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));

snooper.watcher.getPostWatcher('jailbreak')
    .on('post', function(post) {
        const mods = ['fattyfat', 'aaronp613', 'Hipp013', 'exjr_', 'iAdam1n', 'ibbignerd', 'hizinfiz', 'saurik', 'PJ09', 'jailbreakmods', 'AutoModerator', 'JailbreakFlairBot'];
        const flair = new String(post.data.link_flair_text);
        if (flair.toLowerCase() !== 'meta') return undefined
        if (mods.indexOf(post.data.author) > -1) {
            const role = client.guilds.get(config.rjb).roles.get(config.subreddit_news)
            role.setMentionable(true).then(() => {
                role.guild.channels.get(config.subreddit_news_channel).send(`${role} New Meta Post by ${post.data.author} - Title: ${post.data.title} - Link: https://www.reddit.com${post.data.permalink}`).then(() => {
                    role.setMentionable(false);
                }).catch(console.error);
            })
        }

    })
    .on('error', console.error)




client.setProvider(sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))).catch(console.error)

client
.on("ready",()=>events.ready(client))
.on("error",err=>events.error(err))
.on("message", message=>events.message(message))
.on("messageUpdate", (old_message, new_message)=>events.messageUpdate(old_message,new_message))
.on("messageDelete", message => events.messageDelete(message))
.on("guildMemberAdd",  member =>events.guildMemberAdd(member))
.on("guildMemberUpdate", (old, newM) =>events.guildMemberUpdate(old,newM))
.on("guildMemberRemove", member =>events.guildMemberRemove(member))

if (require.main === module) client.login(config.token);



