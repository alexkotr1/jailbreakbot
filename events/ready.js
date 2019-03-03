const cron = require("node-cron");
const apply = require("../utilities/request_a_role"),
	  functions = require("../functions/functions").modules,
	  config = require("../config"),
	  db = require("../utilities/db").db

exports.ready = async function ready(client){
    console.log(`Logged in. Servers:${client.guilds.size} Users:${client.users.size}`);
    const rjailbreak = client.guilds.get(config.rjb);
    if (!rjailbreak) return client.destroy()
        functions.prepare_reports(rjailbreak)
        rjailbreak.fetchMembers().then(() => {
            console.log(`Total cached users ${client.users.size}`);
        });
        apply(client)
		cron.schedule('* * * * *', ()=>{
			const muted_Role = rjailbreak.roles.get(config.muted)
			const muted_members = muted_Role.members.array();
			if (!muted_members.length) return undefined
			muted_members.map(async member=>{
				const time_to_unmute = await db.hget(`${member.user.id}mutedInfo`,'date_to_unmute');
				if (!time_to_unmute) return undefined
				if (parseInt(time_to_unmute) < Date.now()) {
					member.removeRole(muted_Role).catch(console.error)
					await db.del(`${member.user.id}mutedInfo`)
				}
			})

		})       

    client.user.setActivity(`Save blobs!!`);
}