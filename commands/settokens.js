const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //returns the daily leaderboards for _other_bot xp gain
    if (message.author.id != "[my id]") return;
    let str = message.content.toLowerCase().split(" ")[1];
    if (message.guild) {
        if (!str) return message.channel.send("Please supply a valid user username, tag, id, or mention");
        var user = message.guild.members.cache.find(m => m.user.id == str.replace(/\D/g, ''));
        if (!user)
            user = message.guild.members.cache.find(m => m.user.tag.toLowerCase() == str);
        if (!user)
            user = message.guild.members.cache.find(m => m.user.username.toLowerCase() == str);
        if (!user) return message.channel.send("Please supply a valid user username, tag, id, or mention");
    }
    else
        user = {
            id: str.replace(/\D/g, '')
        }
    var int = parseInt(message.content.split(" ")[2]);
    if (int == undefined || int == null) return message.channel.send("Please define an amount");
    client.get(`${user.id}`, function (err, res) {
        if (err) console.log(err);
        res = JSON.parse(res);
        if (message.content.split[3]) {
            if (message.content.split(" ")[3].startsWith("+"))
                int = (res._currency + int);
            else if (message.content.split(" ")[3].startsWith("-"))
                int = (res._currency - int);
        }
        setTimeout(() => {
            if (res) {
                res._currency = int;
                client.set(`${user.id}`, JSON.stringify(res), function (err, res) {
                    if (err) console.log(err);
                });
            }
            else {
                client.set(`${user.id}`, JSON.stringify({ TOKENS: int, MODIFIER: 1 }), function (err, res) {
                    if (err) console.log(err);
                });
            }
            message.channel.send("Done!");
        }, 20);
    });
}
module.exports.help = {
    name: "settokens",
    red: true
}