const redis = require("async-redis")
const db = redis.createClient();

module.exports = db