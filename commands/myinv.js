const Discord = require("discord.js");
const redis = require("redis");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //returns the daily leaderboards for _other_bot xp gain
    var em = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setTimestamp(Date.now())
        .setFooter(message.author.id, message.author.avatarURL());
    client.get(`${message.author.id}`, function (err, res) {
        if (err) console.log(err);
        res = JSON.parse(res);
        if (res) {
            em.setDescription(`**Tokens: ${res._currency}**`)
            var str = "```js\n";
            for (i in res) {
                if (i != "TOKENS")
                    if (res[i].usage) {
                        str += `${res[i].name}: "${res[i].description}", ${res[i].amount}\n`;
                    }
                    else
                        str += `${i}: ${res[i]}\n`;
            }
            str += "```";
            em.addField("Other Stats", str);
        }
        else
            em.setDescription("This user has no tokens!");
        message.channel.send(em);
    });
}
module.exports.help = {
    name: "myinv",
    red: true
}