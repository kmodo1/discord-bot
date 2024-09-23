const Discord = require("discord.js");
const redis = require("redis");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //sets a server option
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_MESSAGES") && message.author.id != "[my id]") return;
    client.get("options", function (err, res) {
        if (err) console.log(err);
        res = JSON.parse(res);
        var key = message.content.split(" ")[1];
        var val = res[key];
        if (val != undefined && val != null) {
            switch (typeof val) {
                case "string": res[key] = message.content.split(" ")[2];
                    break;
                case "boolean":
                    if (message.content.split(" ")[2].toLowerCase() == "true")
                        res[key] = true;
                    else if (message.content.split(" ")[2].toLowerCase() == "false")
                        res[key] = false
                    else return message.reply("Sorry, that option only takes true/false values!");
                    break;
                case "number":
                    if (parseInt(message.content.split(" ")[2]))
                        res[key] = parseInt(message.content.split(" ")[2]);
                    else return message.reply("Sorry, that option only takes integer values!");
                    break;
            }
            message.channel.send(`Set ${key} to ${res[key]}`);
        }
        else {
            return message.reply("Sorry, cannot find that option!");
        }
        client.set("options", JSON.stringify(res), function (err, res) {
            if (err) console.log(err);
        });
    });
}
module.exports.help = {
    name: "set",
    red: true
}