const Discord = require("discord.js");
const redis = require("redis");
const Item = require("../utils/Item.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //uses an item
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != "[my id]") return;
    client.get("" + message.author.id, async function (err, res) {
        if (err) console.log(err);
        res = JSON.parse(res);
        if (!res) return message.channel.send("You have not earned any tokens yet!");
        var stuff = res[message.content.split(" ")[1]];
        if (stuff) {
            var item = new Item(stuff.name, stuff.price, stuff.description, stuff.usage, stuff.amount);
            await item.use(bot, message, client);
            res[message.content.split(" ")[1]].amount = item.amount - 1;
            var temp = {};
            if (res[message.content.split(" ")[1]].amount <= 0) {
                for (i in res)
                    if (i != message.content.split(" ")[1])
                        temp[i] = res[i];
                setTimeout(() => {
                    client.set(`${message.author.id}`, JSON.stringify(temp), function (err, res) {
                        if (err) console.log(err);
                    });
                }, 10);
            }
            else
                setTimeout(() => {
                    client.set(`${message.author.id}`, JSON.stringify(res), function (err, res) {
                        if (err) console.log(err);
                    });
                }, 10);
            return message.channel.send(item.name + " was used!");
        }
        else
            message.channel.send("You either don't have that item, or that item doesn't exist!");
    });
}
module.exports.help = {
    name: "use",
    red: true
}
