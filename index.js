const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

let captureList = fs.readFileSync('./captureList.txt').toString().split(/\r?\n+ */gm)
if(captureList[captureList.length - 1] === "") captureList.pop();

let replaceList = fs.readFileSync('./replaceList.txt').toString().split(/\r?\n+ */gm)
if(replaceList[replaceList.length - 1] === "") replaceList.pop();

const client = new Discord.Client({
    intents: new Discord.Intents()
    .add(
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_WEBHOOKS,
        Discord.Intents.FLAGS.GUILDS
    )
});

client.on("messageCreate", async message => {
    if(message.author.bot) return;
    let words = message.content.split(/ +/gm);
    let wordsModified = new Array(...words);
    let sendFlag = false;

    for(i = 0; i < words.length; i++) {
        let ind = captureList.indexOf(words[i]);
        if(ind != -1) {
            sendFlag = true;
            wordsModified[i] = replaceList[ind];
        }
    }

    if(sendFlag) {
        let channelHooks = await message.channel.fetchWebhooks();
        let captureHook = channelHooks.find((k, v) => v.name === "captureHook");
        if(captureHook) {
            captureHook.send({
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL(),
                content: wordsModified.join(" "),
                attachments: message.attachments.toJSON()
            })
            message.delete().catch(() => {});
        } else {
            message.channel.createWebhook("captureHook")
            .then(hook => {
                hook.send({
                    username: message.author.username,
                    avatarURL: message.author.displayAvatarURL(),
                    content: wordsModified.join(" "),
                    attachments: message.attachments.toJSON()
                })
                message.delete().catch(() => {});
            })
            .catch(() => {})
        }
    }
})

client.on("ready", c => {
    console.log(`Logged in as ${c.user.tag} (${c.user.id})`);
})

client.login(config.token || process.env.token);