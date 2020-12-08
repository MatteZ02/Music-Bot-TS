import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const QueueCommand = new Command({
    name: "queue",
    alias: ["q", "list", "songs"],
    usage: "",
    description: "see the song queue",
    onlyDev: false,
    cooldown: 2,
    category: "music",
    execute: (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - queue");
        const player = client.player.get(msg.guild?.id as string);
        if (!player) return msg.channel.send(client.messages.noPlayer);
        const page = 1;
        let queuesongs = player.queue.songs.slice((page - 1) * 20 + 1, page * 20 + 1);
        let queuemessage = `${queuesongs.map(song => `**#** ${song.title}`).join("\n")}`;
        const hashs = queuemessage.split("**#**").length;
        for (let i = 0; i < hashs; i++) {
            queuemessage = queuemessage.replace("**#**", `**${i + 1}**`);
        }
        const embed = new Discord.MessageEmbed()
            .setTitle(client.messages.queueTitle)
            .setDescription(
                `${client.messages.queueDesc.replace(
                    "%SONG%",
                    player.queue.songs[0].title
                )}\n${queuemessage}`
            )
            .setFooter(
                `${player.queue.songs.length > 20 ? player.queue.songs.length - 21 : "0"} ${
                    client.messages.queueFooter
                }`
            )
            .setColor(client.config.embedColor);
        return msg.channel.send(embed);
    }
});

export default QueueCommand;
