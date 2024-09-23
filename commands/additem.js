const Discord = require("discord.js");
const redis = require("redis");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //adds an item using the given item constructor parameters
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != "[my_id]") return;
    client.get("items", function (err, res) {
        if (err) console.log(err);
        var msg = message.content;
        var args = msg.split(" ");
        var name = args[1];
        var price = parseInt(args[2]);
        var amount = parseInt(args.pop());
        msg = msg.substring(0, msg.length - 1);
        var desc = msg.substring(msg.indexOf("d: ") + 3, msg.indexOf("u: ") - 1);
        var usage = msg.substring(msg.indexOf("u: ") + 3);
        res = JSON.parse(res)
        res.push({
            name: name,
            price: price,
            description: desc,
            usage: usage,
            amount: amount
        });
        message.channel.send("Added!");
        client.set("items", JSON.stringify(res), function (err, res) {
            if (err) console.log(err);
        });
    });
}
module.exports.help = {
    name: "additem",
    red: true
}
