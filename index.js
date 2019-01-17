Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function save_images(message){
    if (message.attachments.array().length){
        const dest = './messages_pics/'
        download([message.attachments.array()[0].url], dest)
.then(result => {
    const staff_server = client.guilds.get(config.staff_server)
    staff_server.channels.get(config.pics_logging_channel).send({
        files: [{
          attachment: result[0].filename,
          name: 'file.jpg'
        }]
      }).then(async msg=>{
          await db.set('pic_' + message.id,msg.attachments.array()[0].url)
      })
})
.catch(error => console.error("downloaded error", error))
    }

}
function post(embed) {
    const staff_server = client.guilds.get(config.staff_server);
    const rjailbreak = client.guilds.get(config.rjb);
    try {
        staff_server.channels.get(config.staff_server_logs).send({embed})
        rjailbreak.channels.get(config.server_logs).send({embed})
    }
    catch(err){
        console.error(err)
    }

}
async function find_tweaks(msg){
    const tweaks_array = await tweaks.returnTweakInfo(msg.content);
    if (tweaks_array.length == 0) return undefined
    const embeds_array = []
    for (var x =0;x<tweaks_array.length;x++){
        const tweak = tweaks_array[x]
        const embed = new Discord.RichEmbed()
        .setTitle("Tweak Lookup")
        .addField("Name",tweak.display ? tweak.display : 'N\/A')
        .addField("Package ID",tweak.name ? tweak.name : 'N\/A')
        .addField("Description",tweak.summary ? tweak.summary : 'N\/A')
        .addField("Version",tweak.version ? tweak.version : 'N\/A')
        .addField("Section",tweak.section ? tweak.section : 'N\/A')
        .setColor(0x8A2BE2)
        .addField("Deb Download",`[Link](${tweak.deb ? tweak.deb : 'N\/A'})`)
        if (tweak.paid == true || tweak.paid === 'true') embed.addField("Price",'$' + tweak.price)
        else if (tweak.paid == false || tweak.paid === 'false') embed.addField("Price","Free")
       embed.addField("Repo",`[${tweak.repo ? tweak.repo.name : tweak.repo_name}](${tweak.repo ? tweak.repo.url : tweak.repo_url})`)
       if (tweak.img) embed.setThumbnail(tweak.img)
        embeds_array.push({embed})
    }
    msg.channel.send(embeds_array[0]).then(async message => {
        if (embeds_array.length <= 1) return undefined
        db.set(message.id + 'reactions', 0)
        await message.react('⬅');
        await message.react('➡')
        const filter = (reaction, user) => reaction.emoji.name === '➡' && user.id == msg.author.id
        const collector = message.createReactionCollector(filter, {
            time: 200000
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
}

function compare(a1, a2) {

    var a = [],
        diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        if (k !== 'remove') diff.push(k);
    }
    return diff;
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    if (min.toString().length == 1) min = '0' + min;
    var sec = a.getSeconds();
    if (sec.toString().length == 1) sec = '0' + sec;
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}


const {
    CommandoClient
} = require('discord.js-commando');
const Discord = require("discord.js");
const path = require('path');
const cron = require("node-cron");
const Snooper = require('reddit-snooper');
const config = require("./config.json");
const redis = require("async-redis"),
    db = redis.createClient(),
    xpdb = redis.createClient({
        db:2
    })
const tweaks = require("./tweaks.js")
const download = require('images-downloader').images;
snooper = new Snooper({
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
        ['levelling', 'Levelling']

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
                role.guild.channels.get(config.subreddit_news_channel).send(`${role} New Meta Post by ${post.data.author} - Title: ${post.data.title} - Link: https://www.reddit.com${post.data.permalink}`).catch(console.error);
            }).then(() => {
                role.setMentionable(false);
            });
        }

    })
    .on('error', console.error)

client.on("error",err=>console.error(err));

client.on('ready', async () => {
    console.log(`Logged in. Servers:${client.guilds.size} Users:${client.users.size}`);
    const rjailbreak = client.guilds.get(config.rjb);
    if (!rjailbreak) return client.destroy()
        prepare_reports(rjailbreak)
        rjailbreak.fetchMembers().then(() => {
            console.log(`Total cached users ${client.users.size}`);
        });
		cron.schedule('* * * * *', ()=>{
			const muted_Role = rjailbreak.roles.get(config.muted)
			const muted_members = muted_Role.members.array();
			if (!muted_members.length) return undefined
			muted_members.map(async member=>{
				const time_to_unmute = await db.hget(`${member.user.id}mutedInfo`,'date_to_unmute');
				if (parseInt(time_to_unmute) < Date.now()) {
					member.removeRole(muted_Role).catch(console.error)
					await db.del(`${member.user.id}mutedInfo`)
				}
			})

		})       
    

    client.user.setActivity(`Save blobs!`);
});

client.on("messageDelete",async message =>{
    if ((message.author.bot || !message.guild  || message.webhookID || message.length > 1024)  && message.guild.id != config.rjb) return undefined
        const pic_path = await db.get("pic_" + message.id);
            const embed = new Discord.RichEmbed()
            .setTitle("Message Deleted")
            .addField("User", message.author.tag + ` (${message.author})`, true)
            .addField("Message:", message.content.length ? message.content : 'N\/A')
            .addField("Channel", message.channel)
            .setThumbnail(message.author.avatarURL)
            .setColor(0xff0000)
            .setFooter(message.author.id)
            .setTimestamp()
            if (pic_path) embed.setImage(pic_path)
            post(embed, 'messageDelete',message);
})


client.on("messageUpdate", async (old_message, new_message)=>{
    const channels_to_ignore = [config.admin,config.dev_backroom]
    if (!new_message.guild || new_message.guild.id !== config.rjb || new_message.author.bot || new_message.webhookID || channels_to_ignore.indexOf(new_message.channel.id) > -1) return undefined
        check_for_bad_words_and_invites_and_report(new_message)
        const embed = new Discord.RichEmbed()
        .setTitle("Message Updated")
        .addField("User", new_message.author.tag + ` (${new_message.member})`, true)
        .addField("Old Message:", (old_message.content.length < 1024 || old_message.content) ? old_message.content : 'N\/A')
        .addField("New Message:", (new_message.content.length < 1024 || new_message.content) ? new_message.content : 'N\/A')
        .addField("Channel", new_message.channel)
        .setThumbnail(new_message.author.avatarURL)
        .setColor(0x0297DB)
        .setFooter(new_message.author.id)
        .setTimestamp()
    post(embed);
});
client.on("guildMemberUpdate", (old, newM) => {
    if (newM.guild.id !== config.rjb) return undefined
    if (newM.user.id === client.user.id) return undefined
        if (newM.nickname && !old.nickname) {
            const embed = new Discord.RichEmbed()
                .setTitle("Nickname Set")
                .addField("User", newM.user.tag, true)
            .addField("Nickname", newM.nickname)
            .setThumbnail(newM.user.avatarURL)
            .setColor(0x0297DB)
            .setFooter(newM.user.id)
            .setTimestamp()
            post(embed);
        } else if (newM.nickname && old.nickname && newM.nickname !== old.nickname) {
            const embed = new Discord.RichEmbed()
            .setTitle("Nickname Changed")
            .addField("User", newM.user.tag, true)
            .addField("New Nickname", newM.nickname)
            .addField("Old Nickname", old.nickname)
            .setThumbnail(newM.user.avatarURL)
            .setColor(0x0297DB)
            .setFooter(newM.user.id)
            .setTimestamp()
            post(embed)
        } else if (!newM.nickname && old.nickname) {
            const embed = new Discord.RichEmbed()
                .setTitle("Nickname Reset")
                .addField("User", newM.user.tag, true)
            .addField("Old Nickname", old.nickname)
            .setThumbnail(newM.user.avatarURL)
            .setColor(0x0297DB)
            .setFooter(newM.user.id)
            .setTimestamp()
            post(embed)
        } else if (newM.nickname === old.nickname) {
            if (old.roles !== newM.roles) {
                for (index = 0; index < newM.roles.array().length; ++index) {
                    if (newM.roles.array()[index].name !== '@everyone') {
                        if (!newRoles) var newRoles = [newM.roles.array()[index].name]
                        else newRoles.push([newM.roles.array()[index].name]);
                    }
                }
                for (indexx = 0; indexx < old.roles.array().length; ++indexx) {
                    if (old.roles.array()[indexx].name !== '@everyone') {
                        if (!roles) var roles = [old.roles.array()[indexx].name]
                        else roles.push([old.roles.array()[indexx].name]);
                    }
                }
                const embed = new Discord.RichEmbed()
                .addField("User", newM.user.tag, true)
                .setThumbnail(newM.user.avatarURL)
                .setColor(0x0297DB)
                .setFooter(newM.user.id)
                .setTimestamp()
                if (!roles) {
                    if (newRoles.length == 1) {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Role (${newRoles.length})`, newRoles)
                    } else {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Roles Removed")
                        else embed.setTitle("Roles Added")
                        embed.addField(`Roles (${newRoles.length})`, newRoles)
                    }
                } else if (!newRoles) {
                    if (roles.length == 1) {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Role (${roles.length})`, roles)
                    } else {

                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Roles Removed")
                        else embed.setTitle("Roles Added")
                        embed.addField(`Roles (${roles.length})`, roles)
                    }
                } else {
                    if (compare(roles, newRoles).length == 1) {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Role (${compare(roles,newRoles).length})`, compare(roles, newRoles))
                    } else {
                        if (old.roles.array().length > newM.roles.array().length) embed.setTitle("Role Removed")
                        else embed.setTitle("Role Added")
                        embed.addField(`Roles (${compare(roles,newRoles).length})`, compare(roles, newRoles))
                    }
                }

                post(embed, 'guildMemberUpdate');
            }
        }

});
client.on("guildMemberRemove", member => {
    if (member.guild.id !== config.rjb) return undefined
    const embed = new Discord.RichEmbed()
        .setTitle("Member Left")
        .addField("User", member.user.tag + ` (${member})`, true)
        .addField("Created", member.user.createdAt)
        .setThumbnail(member.user.avatarURL)
        .setColor(0x8A2BE2)
        .setFooter(member.user.id)
        .setTimestamp()
    post(embed, 'guildMemberRemove');
});
client.on("guildMemberAdd", async member => {
    if (member.guild.id !== config.rjb) return undefined
    const embed = new Discord.RichEmbed()
        .setTitle("User Joined")
        .addField("User", member.user.tag + `(${member})`, true)
        .addField("Created", member.user.createdAt)
        .setThumbnail(member.user.avatarURL)
        .setColor(0x00FF7F)
        .setFooter(member.user.id)
        .setTimestamp()
    post(embed, 'guildMemberAdd');
    const exists = await db.exists(`${member.user.id}mutedInfo`)
	if (exists) {
		member.addRole(member.guild.roles.get(config.muted)).catch(console.error)
		const id = await db.hget("ping_preferences_options", "channel")
		const reports_channel = member.guild.channels.get(id)
		if (!reports_channel) return undefined
		reports_channel.send(`${member} just tried to mute evade!`).catch(console.error)
	}
});

client.on("message", message=> {
    if (message.author.bot || !message.guild || !message.member || message.webhookID) return undefined
   check_for_bad_words_and_invites_and_report(message);
   add_experience_points(message);
   check_for_mentions(message);
   save_message(message);
   find_tweaks(message);
   save_images(message)
});
async function save_message(message){	
	const count = await db.get(`${message.channel.id}messageListCount`)
    db.hmset(
    "messages" + message.channel.id + count ? count : 0,
    "id",message.id,
    "content",message.content,
    "channel",message.channel.id,
    "author",message.author.tag,
    "channelN",message.channel.name,
    "date",timeConverter(message.createdAt.getTime() / 1000)
    ).then(()=>db.incrbyfloat(message.channel.id + 'messageListCount',1))

}
async function check_for_mentions(message){
	if (message.author.bot) return undefined
	const member_mentions = message.mentions.members.array()
	const role_mentions = message.mentions.roles.array()
    const reports = message.guild.channels.get(await db.hget("ping_preferences_options","channel"));
    const muted_role = message.guild.roles.get(config.muted)
	if (!reports || !muted_role) return undefined
	if (role_mentions.length >= 2){
        message.delete();
        message.member.addRole(muted_role).catch(console.error)
		return reports.send(`Hello, ${message.member} pinged ${role_mentions.length} roles in the same message.\n(${role_mentions.map(item=>item.name)})`);		
	}
	if (!member_mentions.length) return undefined
	const db_data = await db.get(`${message.author.id}_mention_count`)
	var count = db_data ? parseInt(db_data) : 0;
	count += member_mentions.length
	if (count >= 4) {
        message.delete().catch(console.error);
        message.member.addRole(muted_role).catch(console.error)
		var new_content = message.content
		member_mentions.map(member=>{
			const regex = new RegExp(`<@!?${member.user.id}\>`,'g')
			new_content = new_content.replace(regex,'@' + member.user.tag)
		});
		return reports.send(`Hello, ${message.member} just pinged ${count} people in ${message.channel}.\nMessage Content: ${new_content}`).then(()=>message.member.send("**Woah there!** That's a bit too fast. Contact a member of server staff to remove your mute."))
	}
	else db.set(`${message.author.id}_mention_count`,count,'EX','5')
}
async function add_experience_points(message){
    const exists = await xpdb.exists("level_" + message.author.id);
    if (!exists) xpdb.set("level_" + message.author.id,1)
    const xp_roles = await xpdb.hgetall("XP_ROLES")
    if (xp_roles){
    const actual_levels = Object.getOwnPropertyNames(xp_roles)
    for (var a = 0;a<actual_levels.length;a++){
        const member_level = await xpdb.get('level_' + message.author.id);
        if (member_level >= parseInt(actual_levels[a])){
            const role = message.guild.roles.get(xp_roles[actual_levels[a]])
            if (role){
            message.member.addRole(role).catch(console.error)
            }
        }
    }
}
    if (message.content.length <= 3) return undefined
    const is_spam = checkspam(message.content);
    if (is_spam == undefined) return undefined
    const key_name = `SPAM_CHECK_${message.author.id}`
    const time = await xpdb.hget(key_name,'time');
    const is_xp_blocked = await xpdb.exists('XP_BLOCKED_' + message.author.id)
    if (is_xp_blocked){
        return undefined
    }
    if (!time){
        await xpdb.hmset(key_name,'message_1',message.content,'time',1);
    }
    else {
        if (time <= 10){
            await xpdb.hmset(key_name,'message_' + time.toString(), message.content,'time',parseInt(time) + 1)
            await xpdb.set('XP_BLOCKED_' + message.author.id,'1','EX',3)
            return undefined
        }
        else {
            const messages = await xpdb.hgetall(key_name);
            var final_xp_to_add = 0;
            for (var x = 0;x<Object.values(messages).length;x++){
                const xp_to_add = Math.round(Math.random() * 2 + Math.pow(Object.values(messages)[x].length,-1)*3);
                final_xp_to_add += xp_to_add
            }
            xpdb.incrbyfloat('xp_' + message.author.id, final_xp_to_add).then(async data=>{
                await xpdb.del(key_name)
                const db_level = await xpdb.get("level_" + message.author.id);
                const level = db_level ? parseInt(db_level) : 1
                var xp_to_reach = 0;
                const numbers_to_add = []
                for (var e = 0;e<level;e++){
                numbers_to_add.push(45 * (div(level) + 1))
                }
                numbers_to_add.map(item=>xp_to_reach+=item)
                if (parseInt(data) >= xp_to_reach) {
                const current_level = await xpdb.incrbyfloat("level_" + message.author.id,1)
                   if(xp_roles){
                    const levels = Object.getOwnPropertyNames(xp_roles);
                    for (var e = 0;e < levels.length;e++){
                        if (current_level == levels[e]){
                            const is_announced = await xpdb.exists('announced_' + current_level + '_' + message.author.id)
                            if (!is_announced){
                            const role = await message.guild.roles.get(xp_roles[levels[e]])
                            message.reply(`Congratulations!, you have reached level ${current_level} and have been promoted to ${role.name}`).then(async ()=>{
                                await xpdb.set('announced_' + current_level + '_' + message.author.id,1)
                            })
                            message.member.addRole(role).catch(console.error)
                            }
                        }                    
                    }
                  }
                }
            })

        }
    }    
}

function checkspam(string){
        if (!string) return undefined
        const init = string.split('');
        const final = eliminateDuplicates(init);
        const results = final.length == 1 ? 100 : ((init.length - final.length) / init.length) * 100;
        if (results > 70) return true
        return false
}

function eliminateDuplicates(arr) {
	var i,
		len = arr.length,
		out = [],
		obj = {};
  
	for (i = 0; i < len; i++) {
	  obj[arr[i]] = 0;
	}
	for (i in obj) {
	  out.push(i);
	}
	return out;
  }

  function div(number){
      return Math.floor(parseInt(number) / 10)
  }

  async function check_for_bad_words_and_invites_and_report(message) {
    if (message.author.bot || !message.guild || message.webhookID) return undefined
    const has_invite = await contains_invite(message)
    const has_bad_words = await contains_bad_words(message)
    const reports_channel = message.guild.channels.get(await db.hget("ping_preferences_options", "channel"))
    const people_to_ping = has_bad_words.length ? await choose_who_to_ping(message, get_higher_priority(has_bad_words)) : await choose_who_to_ping(message, 1)
    if (!reports_channel) return undefined
    if (has_invite && has_bad_words.length) {
        message.delete().catch(console.error);
        reports_channel.send(`Hello, ${message.member} mentioned ${has_bad_words.length} prohibited word${has_bad_words == 1 ? '' : 's'} and tried to advertise a server that we are not affiliated with in ${message.channel}\nBad Words: ${has_bad_words.map(word => word.bad_word)}\nMessage Content: ${message.content}\n${people_to_ping}`)
    }
    else if (has_invite && !has_bad_words.length) {
        message.delete().catch(console.error);
        reports_channel.send(`Hello, ${message.member} tried to advertise a server that we are not affiliated with in ${message.channel}\nMessage Content:${message.content}\n${people_to_ping}`)
    }
    else if (has_bad_words.length && !has_invite) {
        message.delete().catch(console.error)
        reports_channel.send(`Hello, ${message.member} mentioned ${has_bad_words.length} prohibited word${has_bad_words.length == 1 ? '' : 's'} in ${message.channel}\nBad Words: ${has_bad_words.map(word => word.bad_word)}\nMessage Content: ${message.content}\n${people_to_ping}`)
    }
}


async function contains_bad_words(message) {
    const exempted_channels = await db.hkeys("filter_exempted_channels")
    const exempted_roles = await db.hkeys("filter_exempted_roles")
    if (message.author.bot || message.content === "" || exempted_channels.indexOf(message.channel.id) > -1 || array_check_for_mutual_value(message.member.roles.array().map(item => item.id), exempted_roles).length) return []
    const modified_content = message.content
        .replace(/\s/g, "")
        .toLowerCase()
    const badwords = await db.hgetall("bad_words")
    if (!badwords) return []
    const names = Object.getOwnPropertyNames(badwords)
    var used_bad_words = []
    for (var x = 0; x < names.length; x++) {
        if (names[x] && modified_content.includes(names[x])) {
            used_bad_words.push({
                bad_word: names[x],
                priority: badwords[names[x]]
            })
        }
    }
    return used_bad_words
}

async function contains_invite(message) {
    if (!message.content.replace(/\s/g, '').toLowerCase().match(/discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\//g)) return undefined
    const exempted_channels = await db.hkeys("invites_exempted_channels")
    const exempted_roles = await db.hkeys("invites_exempted_roles")
    const exempt_invites = await db.hkeys("exempt_invites")
    if (!exempt_invites) return true
    const has_exempt_role = array_check_for_mutual_value(message.member.roles.array().map(item=>item.id), exempted_roles)
    if (message.content === "" || exempted_channels.indexOf(message.channel.id) > -1 || has_exempt_role.length) return undefined
    const occurrences_count = (message.content.match(/discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\//g) || []).length
    var occurrences_with_known_invite_count = 0
    exempt_invites.map(invite => {
        const regex = new RegExp(`discord\.gg\/${invite}|discord\.com\/invite\/${invite}|discordapp\.com\/invite\/${invite}`)
        occurrences_with_known_invite_count += (message.content.match(regex) || []).length
    })
    if (occurrences_count > occurrences_with_known_invite_count) return true
    else return false
}
function array_check_for_mutual_value(a, b) {
    var result = [];
    while (a.length > 0 && b.length > 0) {
        if (a[0] < b[0]) { a.shift(); }
        else if (a[0] > b[0]) { b.shift(); }
        else {
            result.push(a.shift());
            b.shift();
        }
    }
    return result
}

function get_higher_priority(arr) {
    if (!arr) return undefined
    var highest_priority = 0
    for (var x = 0; x < arr.length; x++) {
        if (arr[x].priority > highest_priority) highest_priority = arr[x].priority
    }
    return highest_priority
}

async function choose_who_to_ping(message, highest_priority) {
    if (highest_priority == 0) return ''
    else if (highest_priority == 1) {
        const db_mods_to_ping = await db.hgetall("mods_ping_preferences")
        if (!db_mods_to_ping) return ""
        const mods = message.guild.roles.get(config.moderator).members.array();
        var mods_to_ping = []
        for (var x = 0; x < mods.length; x++) {
            const mod = mods[x];
            if (db_mods_to_ping[mod.id]){
            if (db_mods_to_ping[mod.id] == 1 && mod.presence.status === 'online') mods_to_ping.push(`<@${mod.id}>`)
            else if (db_mods_to_ping[mod.id] == 2 && mod.presence.status !== 'dnd') mods_to_ping.push(`<@${mod.id}>`)
            else continue
            }
        }
        return mods_to_ping
    }
    else if (highest_priority == 2) {
        return message.guild.roles.get(config.moderator)
    }
    else return undefined
}

async function prepare_reports(rjb) {
    const data = await db.hgetall("ping_preferences_options")
    if (!data) return undefined
    const reports_channel = rjb.channels.get(data.channel);
    if (!reports_channel) return undefined
    const msg = await reports_channel.fetchMessage(data.message);
    if (!msg) return undefined
    msg.reactions.array().map(async reaction => {
        const fetched_reactors = await reaction.fetchUsers()
        fetched_reactors.filter(user => !user.bot).array().map(reactor => reaction.remove(reactor));
    })

    const emoji_1 = '1⃣'
    const emoji_2 = '2⃣'
    const emoji_3 = '3⃣'

    await msg.react(emoji_1)
    await msg.react(emoji_2)
    await msg.react(emoji_3)

    const filter = (reaction, user) => reaction._emoji.name === emoji_1 && user.id !== msg.author.id
    const filter2 = (reaction, user) => reaction._emoji.name === emoji_2 && user.id !== msg.author.id
    const filter3 = (reaction, user) => reaction._emoji.name === emoji_3 && user.id !== msg.author.id

    const collector = msg.createReactionCollector(filter);
    const collector2 = msg.createReactionCollector(filter2);
    const collector3 = msg.createReactionCollector(filter3);

    collector.on("collect", async r => {
        const reactor = r.users.filter(user => !user.bot).array()[0]
        await db.hmset("mods_ping_preferences", reactor.id, 0)
        r.remove(reactor)
    });
    collector2.on("collect", async r => {
        const reactor = r.users.filter(user => !user.bot).array()[0]
        await db.hmset("mods_ping_preferences", reactor.id, 1)
        r.remove(reactor)
    });
    collector3.on("collect", async r => {
        const reactor = r.users.filter(user => !user.bot).array()[0]
        await db.hmset("mods_ping_preferences", reactor.id, 2)
        r.remove(reactor)
    });


}

client.login(config.token);

module.exports = client