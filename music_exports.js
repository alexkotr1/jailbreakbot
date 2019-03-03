const YouTube = require('simple-youtube-api'),
      config = require('./config'),
      youtube = new YouTube(config.google_api_key),
      ytdl = require('ytdl-core'),
    { Util, RichEmbed } = require("discord.js")
var   queue = new Map()

exports.modules = {
youtube : youtube,
ytdl : ytdl,
queue : queue,
handleVideo : handleVideo,
play : play
}

async function handleVideo(video, msg, voiceChannel, playlist = false) {
        const serverQueue = queue.get(msg.guild.id);
        const song = {
            id: video.id,
            title: Util.escapeMarkdown(video.title),
            url: `https://www.youtube.com/watch?v=${video.id}`
        };
    
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            queue.set(msg.guild.id, queueConstruct);
    
            queueConstruct.songs.push(song);
    
            try {
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(msg.guild, queueConstruct.songs[0], msg);
            } catch (error) {
                console.error(`I could not join the voice channel: ${error}`);
                queue.delete(msg.guild.id);
                return msg.reply(`I could not join the voice channel`).then(e=>e.delete(3000));
            }
        } else {
            serverQueue.songs.push(song);
            if (playlist) return undefined;
            else return msg.reply(`**${song.title}** has been added to the queue!`).then(e=>e.delete(10000));
        }
        return undefined;
    } 
    
    
    
    async function play(guild, song, msg) {
        const serverQueue = queue.get(guild.id);
        if (!serverQueue) return undefined
        else if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return undefined
        }
        const embed = new RichEmbed()
        .addField("Now Playing",`[${song.title}](${song.url})`)
        .setTimestamp()
        .setFooter(`Requested by ${msg.author.tag} | ${msg.author.id}`)
        .setColor(0xBB098A)
        msg.channel.send({embed}).then(async message=>{
    await message.react('\u23EF')
    await message.react('\u23ED')
    const filter = (reaction,user) => (reaction.emoji.name === '\u23EF' || reaction.emoji.name === '\u23ED') && user.id != message.author.id
    const collector = message.createReactionCollector(filter);
    collector.on('collect', r => {
        if (!serverQueue.connection.dispatcher) return undefined;
        var id = '';
        for (var x = 0;x<r.users.array().length;x++){
            if (r.users.array()[x].id != message.author.id){
                id = r.users.array()[x].id;
             r.remove(r.users.array()[x]);
            }
        }
        if (id != msg.author.id && !msg.guild.members.get(id).roles.exists("id",config.moderator)) return undefined;
        if (r.emoji.name === '\u23EF'){
            if (serverQueue && !serverQueue.playing) {
                serverQueue.playing = true;
                serverQueue.connection.dispatcher.resume();
            }
            else {
                if (serverQueue && serverQueue.playing) {
                    serverQueue.playing = false;
                    serverQueue.connection.dispatcher.pause();
                }
            }
            
    
        }
        else if (r.emoji.name === '\u23ED'){
            if (!msg.member.voiceChannel) return undefined
            if (!serverQueue) return undefined
            serverQueue.connection.dispatcher.end('Skip command has been used!');
    
        }
    });
    
    
    
    
        });;
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
            .on('end', async () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0], msg);
            })
            .on('error', error => console.error(1 + error));
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    
    }