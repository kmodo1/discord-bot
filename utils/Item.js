const Discord = require("discord.js");
const redis = require("redis");
module.exports = class Item {
    /**
     * Creates a new Item using the given name, price, description,usage, and amount
     * @param {String} name 
     * @param {Number} price 
     * @param {String} description 
     * @param {String} usage 
     * @param {Number} amount
     */
    constructor(name, price, description, usage, amount) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.usage = usage;
        this.amount = amount;
    }
    /**
     * Uses the Item with the usage, using the discord client, message, and redis client
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     * @param {redis.RedisClient} client 
     * @returns {any} the result of the function
     */
    async use(bot, message, client) {
        return await new Function("bot", "message", "client", this.usage)(bot, message, client);
    }
    /**
     *@returns {String} string representation of the parameters of the object 
     */
    toString() {
        return JSON.stringify({
            name: this.name,
            price: this.price,
            description: this.description,
            usage: this.usage,
            amount: this.amount
        });
    }
    /**
     * @returns {JSON} Json object representing the paramaters
     */
    toJson() {
        return {
            name: this.name,
            price: this.price,
            description: this.description,
            usage: this.usage,
            amount: this.amount
        };
    }
}