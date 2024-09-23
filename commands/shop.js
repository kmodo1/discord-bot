const Discord = require("discord.js");
const redis = require("redis");
const Item = require("../utils/Item.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //displays shop
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != "[my id]") return;
    client.get("items", function (err, res) {
        if (err) console.log(err);
        res = JSON.parse(res);
        if (!res) return;
        var items = [];
        for (const it of res) {
            items.push(new Item(it.name, it.price, it.description, it.usage, it.amount));
        };
        client.get("" + message.author.id, function (err, res) {
            if (err) console.log(err);
            res = JSON.parse(res);
            if (!res) res = {};
            str = "```js\nPlace: Name: Price, Description, Amount\n";
            for (var i = 0; i < items.length; i++) {
                if (!res[items[i].name.toLowerCase()])
                    str += `${i + 1}: ${items[i].name}: ${items[i].price}, "${items[i].description}", ${items[i].amount}\n`;
                else if (res[items[i].name.toLowerCase()].amount < items[i].amount)
                    str += `${i + 1}: ${items[i].name}: ${items[i].price}, "${items[i].description}", ${items[i].amount - res[items[i].name.toLowerCase()].amount}\n`;
                else
                    str += `${i + 1}: ${items[i].name}: Bought\n`;
            }
            str += "```";
            var em = new Discord.MessageEmbed()
                .setTimestamp(Date.now())
                .setFooter(message.author.tag, message.author.avatarURL())
                .addField("Items: ", str)
                .setTitle(`Shop for ${message.author.tag}`);
            message.channel.send(em);
        });
    });
}
module.exports.help = {
    name: "shop",
    red: true
}
