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
        var str = "```js\nOption: Value\n";
        for (i in res) {
            str += `${i}: ${res[i]}\n`;
        }
        str += "```";
        var em = new Discord.MessageEmbed()
            .setTitle("Server Options")
            .setTimestamp(Date.now())
            .setFooter("Created")
            .addField("Options", str);
        message.channel.send(em);
    });
}
module.exports.help = {
    name: "options",
    red: true
}