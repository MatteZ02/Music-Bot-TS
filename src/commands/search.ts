import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";
import ytsr from "ytsr";
import he from "he";

const SearchCommand = new Command({
    name: "search",
    alias: ["sr", "find"],
    usage: "<search word(s)>",
    description: "Search the top 10 queries and choose one",
    onlyDev: false,
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - search");
        const searchString = args.slice(1).join(" ");
        const player = client.player.get(msg.guild?.id as string);
        const voiceChannel = msg.member?.voice.channel;
        if (!player) {
            if (!msg.member?.voice.channel) return msg.channel.send(client.messages.noVoiceChannel);
        } else {
            if (voiceChannel !== player.voiceChannel)
                return msg.channel.send(client.messages.wrongVoiceChannel);
        }
        if (!args[1]) return msg.channel.send(client.messages.noQuery);
        if (voiceChannel?.full) return msg.channel.send(client.messages.channelFull);
        if (!voiceChannel?.joinable) return msg.channel.send(client.messages.noPermsConnect);
        if (!voiceChannel.speakable) return msg.channel.send(client.messages.noPermsSpeak);
        if (searchString.length > 127) return msg.channel.send(client.messages.noResults);
        const res = await ytsr(searchString, {
            limit: 20
        }).catch((err: any) => {
            msg.channel.send(client.messages.error + err);
            console.log(`${new Date().toUTCString()} | Error whilst ytsr: ${err}`);
        });
        if (!res || !res.items[0]) return msg.channel.send(client.messages.noResults);
        const videoResults = res.items.filter(
            (item: ytsr.Item) => item && item.type === "video"
        ) as Array<ytsr.Video>;
        const videos = videoResults.slice(0, 10);
        let index = 0;
        const embed = new Discord.MessageEmbed()
            .setTitle(client.messages.songSelection)
            .setDescription(
                `${videos.map(video2 => `**${++index}** ${he.decode(video2.title)} `).join("\n")}`
            )
            .setFooter(client.messages.provideANumber)
            .setColor(client.config.embedColor);
        msg.channel.send(embed);
        try {
            var response = await msg.channel.awaitMessages(
                message2 =>
                    message2.content > 0 && message2.content < 11 && message2.author === msg.author,
                {
                    max: 1,
                    time: 20000,
                    errors: ["time"]
                }
            );
        } catch (err) {
            console.error(err);
            return msg.channel.send(client.messages.cancellingVideoSelection);
        }
        const videoIndex = parseInt(response.first()?.content as string) - 1;
        client.funcs.handleVideo(
            {
                title: videos[videoIndex].title,
                url: videos[videoIndex].link,
                author: msg.author.tag,
                type: "ytsr",
                playerType: "ytdl",
                duration: client.funcs.timeToMs(videoResults[0].duration || 0),
                channel: videos[videoIndex].author.name,
                thumbnail: videos[videoIndex].thumbnail,
                info: null
            },
            msg,
            voiceChannel,
            client,
            false
        );
    }
});

export default SearchCommand;
