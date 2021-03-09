require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on('message', message => {
    if (message.content === "ping") {
        message.reply("pong");
    }
});

client.login(process.env.TOKEN);