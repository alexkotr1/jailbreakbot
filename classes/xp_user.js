const redis = require("async-redis");
const db = redis.createClient({db : 2});
const get_client = require("../index")
const config = require("../config")

exports.modules = class xp_user{
    constructor(id){
    return (async ()=>{
    this.db_xp = await db.get("xp_" + id);
    this.total = this.db_xp ? parseInt(this.db_xp) : 0;
    this.level = this.get_level_from_xp(this.total);
    this.xp_to_rshow = 45 * this.level * (this.div(this.level) + 1);
    this.xp_to_reach = this.xp_for_level(this.level + 1);
    this.previous = this.xp_for_level(this.level);
    this.bef = this.total - this.previous;
    return this
    })();
    }
    get_level_from_xp(xp_to_reach){
        let level = 0
        let xp = 0;
        while (xp <= xp_to_reach){
            xp = xp + 45 * level * (this.div(level) + 1)
            level++  
        }
        level--
        return level
    }
    static async get_level(id){
       function div(number){
            return Math.floor(parseInt(number) / 10)
        }
        function get_level_from_xp(xp_to_reach){
            let level = 0
            let xp = 0;
            while (xp <= xp_to_reach){
                xp = xp + 45 * level * (div(level) + 1)
                level++  
            }
            level--
            return level
        }
        const db_xp = await db.get("xp_" + id)
        const xp = db_xp ? parseInt(db_xp) : 0
        return get_level_from_xp(xp)
    }
    div(number){
        return Math.floor(parseInt(number) / 10)
    }
    xp_for_level(level_to_reach){
        let level = 0
        let xp = 0;
        for (var e = 0;e<level_to_reach;e++){
            xp = xp + 45 * level * (this.div(level) + 1)
            level++
        }
        return xp
    }
    static async get_rank(id,rjb){
        const keys = await db.keys("xp_*");
        const filtered_keys = keys.filter(key=>{
            const member = rjb.members.get(key.substring(3,key.length))
            if (member) return true
            else return false
        })
        var array = []
        for(var x =0;x<filtered_keys.length;x++){
            array.push([filtered_keys[x],await db.get(filtered_keys[x])])
        }
    array.sort(function(a, b) {
        return a[1] - b[1];
    }).reverse();
    for (var e = 0;e<array.length;e++){
        if (array[e][0].endsWith(id)) return e + 1
    }
    return undefined
    }
}