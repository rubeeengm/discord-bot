require('dotenv').config();

const Discord = require('discord.js');
const fetch = require('node-fetch');
const ReplitDatabase = require('@replit/database')

const client = new Discord.Client();
const database = new ReplitDatabase();

sadWords = ["sad", "depressed", "unhappy", "angry", "miserable"];

starterEncouragements = [
    "Cheer up!"
    , "Hang in there."
    , "You are a great person / bot!"
]

database.get('encouragements').then(encouragements => {
    console.log(encouragements);

    if (!encouragements || encouragements.length < 1) {
        database.set('encouragements', starterEncouragements);
    }
});

database.get('respondig').then(value => {
    if (value == null) {
        database.set('responding', true);
    }
});

function getQuote() {
    return fetch('https://zenquotes.io/api/random')
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    return data[0]['q'] + ' - ' + data[0]['a']
                })
    ;
}

function updateEncouragements(encouragingMessage) {
    database.get('encouragements').then(encouragements => {
        encouragements.push(encouragingMessage);

        database.set('encouragements', encouragements);
    });
}

function deleteEncouragment(index) {
    database.get('encouragements').then(encouragements => {
        if (encouragements.length > index) {
            encouragements.splice(index, 1);

            database.set('encouragements', encouragements);
        }
    });
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on('message', message => {
    if  (message.author.bot) {
        return;
    }

    if  (message.content === '$inspire') {
        getQuote().then(
            quote => message.channel.send(quote)
        )
    }

    database.get('responding').then(responding => {
        if (responding && sadWords.some(word => message.content.includes(word))) {
            database.get('encouragements').then(encouragements => {
                const encouragement = encouragements[
                    Math.floor(
                        Math.random() * encouragements.length
                    )
                ];

                message.reply(encouragement);
            });
        }
    });

    if (message.content.startsWith('$new')) {
        encouragingMessage = message.content.split('$new ')[1];

        updateEncouragements(encouragingMessage);

        message.channel.send('New encouraging message added.');
    }

    if (message.content.startsWith('$del')) {
        index = parseInt(message.content.split('$del ')[1]);

        deleteEncouragment(index);

        message.channel.send('Encouraging message deleted');
    }

    if (message.content.startsWith('$list')) {
        database.get('encouragements').then(encouragements => {
            message.channel.send(encouragements);
        });
    }

    if (message.content.startsWith('$responding')) {
        value = message.content.split('$responding ')[1];

        if (value.toLowerCase() == 'true') {
            database.set('responding', true);

            message.channel.send('Responding is on.');
            return;
        }

        database.set('responding', false);
        message.channel.send('Responding is off.')
    }
});

client.login(process.env.TOKEN);