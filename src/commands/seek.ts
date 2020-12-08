import { Command } from "../base/Command";
import Discord from "discord.js";
import ms from "ms";
import Client from "../base/Client";

const SeekCommand = new Command({
    name: "seek",
    alias: ["jump"],
    usage: "<point in song (seconds)>",
    description: "Seek to a specific point in the currently playing song",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 3,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - seek");
        const player = client.player.get(msg.guild?.id as string);
        const command =
            client.commands.get(args[0]) ||
            client.commands.find(cmd => cmd.alias && cmd.alias.includes(args[0]));
        if (await client.funcs.check(client, msg, args)) {
            if (!player) return;
            if (!args[1])
                return msg.channel.send(
                    `${client.messages.correctUsage}\`${process.env.BOT_PREFIX || "!"}}seek ${command?.usage}\``
                );
            const pos = ms(args[1]) / 1000;
            if (isNaN(pos)) return msg.channel.send(client.messages.validNumber);
            if (pos < 0) return msg.channel.send(client.messages.seekingPointPositive);
            if (pos > player.queue.songs[0].duration) {
                return msg.channel.send(
                    client.messages.seekMax.replace(
                        "%LENGTH%",
                        player.queue.songs[0].duration.toString()
                    )
                );
            }
            msg.channel.send(client.messages.seeking.replace("%TIME%", pos.toString()));
            player.replay(pos, args);
        }
    }
});

export default SeekCommand;
