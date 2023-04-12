require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', () => {
    console.log('Bot online!');
});

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI,
});

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    if(message.channel.id !== process.env.CHANNEL_ID) return;
    if(message.content.startsWith('!')) return;

    let conversationLog = [{ role: 'system', content: "You are a friendly chatbot."}];

    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 })
    prevMessages.reverse();
    prevMessages.forEach((msg) => {
        if(message.content.startsWith('!')) return;
        if(message.author.id !== client.user.id && message.author.bot) return;
        if(message.author.id !== message.author.id) return;

        conversationLog.push({
            role: 'user',
            content: msg.content,
        });
    })

    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
    });

    let finalText = result.data.choices[0].message.content;
    let len = finalText.length;

    if (len > 2000) {
        fs.writeFile('message.txt', finalText, function (err) {
          if (err) throw err;
          console.log('Sua mensagem foi salva em um arquivo de texto.');
        });

        message.reply({
            files: [{
                attachment: 'message.txt',
                name: 'message.txt'
            }],
            content: 'Resposta enviada no arquivo.'
        });
    } else {
        message.reply(finalText);
    }
})

client.login(process.env.TOKEN);