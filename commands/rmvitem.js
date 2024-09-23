const Discord = require("discord.js");
const redis = require("redis");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //removes an item with the given name
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != "[my id]") return;
    client.get("items", function (err, res) {
        if (err) console.log(err);
            res = JSON.parse(res);
            res = res.filter(r => r.name.toLowerCase() != message.content.split(" ")[1].toLowerCase());
            message.channel.send("Removed!");
            client.set("items", JSON.stringify(res), function (err, res) {
                if (err) console.log(err);
            });
    });
}
module.exports.help = {
    name: "rmvitem",
    red: true
}
