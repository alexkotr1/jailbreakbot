const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db,
      { RichEmbed } = require("discord.js")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'userinfo',
            group: 'other',
            memberName: 'userinfo',
            description: 'Displays info about a user',
            examples: ['!userinfo'],
            args: [
                {
                    key: 'member',
                    prompt: 'Please provide a member',
                    type: 'member',
					default: ''
                }
            ]
        });    
    }
hasPermission(message) {
        return message.member.roles.exists("id",config.moderator)
    }
    async run(message, {member}) {
        await message.delete();
		if (!member || member == '') member = message.member;
		const res = await db.get(`${member.user.id}status`)
		const date = new Date;
		const diff = date.valueOf() - member.user.createdAt.valueOf();
		const date2 = new Date(member.user.createdTimestamp);
		const diff2 = date.valueOf() - member.joinedAt.valueOf();
		const date4 = new Date(member.joinedTimestamp);
		if (member.lastMessage) var diff3 = date.valueOf() - new Date(member.lastMessage.createdTimestamp);
		const embed = new RichEmbed()
		.setTitle(member.displayName)
		.setThumbnail(member.user.avatarURL)
		.setColor(0x9B59B6)
		.setFooter(`Requested by ${message.author.tag} | ${message.guild.id}`)
		.setTimestamp()
		.addField("User",member.user.tag,true)
		.addField("Status",member.presence.status + ' ' + getRelativeTime(date.valueOf() - parseInt(res)),true)
		.addField("Created",`${date2.customFormat("#MM#/#DD#/#YYYY# #hh#:#mm#:#ss#")} (${getRelativeTime(diff,1)})`)
		.addField("Joined",`${date4.customFormat("#MM#/#DD#/#YYYY# #hh#:#mm#:#ss#")} (${getRelativeTime(diff2,1)})`)
		if (!member.presence.game) embed.addField("Playing",'~~Not in game~~',true);
		else embed.addField("Playing",member.presence.game.name);
		embed.addField("Last Message",member.lastMessage ? `${date4.customFormat("#DD#/#MM#/#YYYY# #hh#:#mm#:#ss#")} (${getRelativeTime(diff3,1)})` : 'Unknown',true)

        message.channel.send({embed}).catch(console.error);		
    }
};

Date.prototype.customFormat = function(formatString){
	var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
	var dateObject = this;
	YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
	MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
	MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
	DD = (D=dateObject.getDate())<10?('0'+D):D;
	DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
	th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
	formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

	h=(hhh=dateObject.getHours());
	if (h==0) h=24;
	if (h>12) h-=12;
	hh = h<10?('0'+h):h;
  hhhh = hhh<10?('0'+hhh):hhh;
	AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
	mm=(m=dateObject.getMinutes())<10?('0'+m):m;
	ss=(s=dateObject.getSeconds())<10?('0'+s):s;
	return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}

function getRelativeTime(ms,param){
    var SECOND_MS = 1000;
    var MINUTE_MS = 60 * SECOND_MS;
    var HOUR_MS = 60 * MINUTE_MS;
    var DAY_MS = 24 * HOUR_MS;
    var WEEK_MS = 7 * DAY_MS;
    var MONTH_MS = 30 * DAY_MS;

    var lookup = ["months", "weeks", "days", "hours", "minutes", "seconds"];
    var values = [];
    values.push(ms / MONTH_MS); ms %= MONTH_MS;
    values.push(ms / WEEK_MS); ms %= WEEK_MS;
    values.push(ms / DAY_MS); ms %= DAY_MS;
    values.push(ms / HOUR_MS); ms %= HOUR_MS;
    values.push(ms / MINUTE_MS); ms %= MINUTE_MS;
    values.push(ms / SECOND_MS); ms %= SECOND_MS;

    var pretty = param == 1 ? '' : 'since '; 
    for(var i=0 ; i <values.length; i++){
        var val = Math.round(values[i]);
        if(val <= 0) continue;
	  if (val >= 588)  pretty = 'since a long while ago'
       else pretty += val + " " + `${val == 1 ? lookup[i].substr(0,lookup[i].length - 1) : lookup[i]}` + " ago";
        break;
    }
    return pretty;
}