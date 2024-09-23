const Discord = require("discord.js");
const redis = require("redis");
const Item = require("../utils/Item.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //buys a thing
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
            if (!res || res._currency == 0) return message.channel.send(`${message.author.tag}, You have no tokens!`);
            var avai = [];
            for (var i = 0; i < items.length; i++) {
                if (!res[items[i].name.toLowerCase()])
                    avai.push(items[i].name.toLowerCase());
                else if (res[items[i].name.toLowerCase()].amount < items[i].amount)
                    avai.push(items[i].name.toLowerCase());
            }
            if (avai.length <= 0) return message.channel.send("You have already bought everything availible");
            let item = message.content.split(" ")[1].toLowerCase();
            if (avai.indexOf(item) == -1)
                if (items.find(i => i.name.toLowerCase() == item)) return message.channel.send("You have already bought that item!");
                else return message.channel.send("Cannot find that item!");
            if (res._currency < items[item]) return message.channel.send("You do not have enough tokens for that!");
            else
                res._currency = res._currency - items.find(i => i.name.toLowerCase() == item).price;
            if (!res[item]) {
                res[item] = JSON.parse(items.find(i => i.name.toLowerCase() == item).toString());
                res[item].amount = 1;
            }
            else {
                var amount = res[item].amount + 1;
                res[item] = JSON.parse(items.find(i => i.name.toLowerCase() == item).toString());
                res[item].amount = amount;
            }
            client.set(message.author.id + "", JSON.stringify(res), function (err, res) {
                if (err) console.log(err);
            });
            message.channel.send(`You have bought ${item} for ${res[item].price} tokens, you can buy ${items.find(i => i.name.toLowerCase() == item).amount - res[item].amount} more`);
        });
    });
}
module.exports.help = {
    name: "buy",
    red: true
}
