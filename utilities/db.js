const redis = require("async-redis"),
      db = redis.createClient(),
      tweakdb = redis.createClient({ db : 1 }),
      xpdb = redis.createClient({ db : 2})

module.exports = {
    db : db,
    tweakdb : tweakdb,
    xpdb : xpdb
}