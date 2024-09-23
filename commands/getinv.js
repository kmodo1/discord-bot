const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //returns the daily leaderboards for _other_bot xp gain
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
    var em = new Discord.MessageEmbed()
        .setTimestamp(Date.now())
        .setFooter(message.author.id, message.author.avatarURL());
    if (user.user)
        em.setAuthor(user.user.tag, user.user.avatarURL());
    else
        em.setAuthor("In dms, can't find users name/tag :|");
    client.get(`${user.id}`, function (err, res) {
        if (err) console.log(err);
        res = JSON.parse(res);
        if (res) {
            em.setDescription(`**Tokens: ${res._currency}**`)
            var str = "```js\n";
            for (i in res) {
                if (i != "TOKENS")
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
    name: "getinv",
    red: true
}