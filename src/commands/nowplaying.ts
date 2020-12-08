import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const NowPlayingCommand = new Command({
    name: "nowplaying",
    alias: ["np"],
    usage: "",
    description: "See information for the currently playing song.",
    onlyDev: false,
    cooldown: 2,
    category: "music",
    execute: (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - nowplaying");
        const player = client.player.get(msg.guild?.id as string);
        if (!player || !player.connection) return msg.channel.send(client.messages.noPlayer);
        let songTime = player.queue.songs[0].duration;
        let completed = (player.connection.dispatcher.streamTime + player.time).toFixed(0);
        let barlength = 30;
        let completedpercent = ((parseInt(completed) / songTime) * barlength).toFixed(0);
        let array = [];
        for (let i = 0; i < parseInt(completedpercent) - 1; i++) {
            array.push("⎯");
        }
        array.push("🔘");
        for (let i = 0; i < barlength - parseInt(completedpercent) - 1; i++) {
            array.push("⎯");
        }
        let desc = `${client.messages.nowPlayingDesc} ${
            player.queue.songs[0].title
        }\n\`${array.join("")}\`\n\`${client.funcs.msToTime(
            completed,
            "hh:mm:ss"
        )} / ${client.funcs.msToTime(songTime, "hh:mm:ss")}\`\nchannel: \`${
            player.queue.songs[0].channel
        }\``;
        if (songTime == 0) {
            desc = `${client.messages.nowPlayingDesc} ${player.queue.songs[0].title}\n\`Livestream\`\nchannel: \`${player.queue.songs[0].channel}\``;
        }
        const thumbnail = player.queue.songs[0].thumbnail;

        const embed = new Discord.MessageEmbed()
            .setTitle(client.messages.nowPlaying)
            .setDescription(desc)
            .setFooter(`Queued by ${player.queue.songs[0].author}`)
            .setURL(player.queue.songs[0].url)
            .setThumbnail(thumbnail)
            .setColor(client.config.embedColor);
        return msg.channel.send(embed);
    }
});

export default NowPlayingCommand;
