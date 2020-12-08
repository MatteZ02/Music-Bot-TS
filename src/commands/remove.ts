import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const RemoveCommand = new Command({
    name: "remove",
    alias: ["rm", "delete"],
    usage: "<song pos>",
    description: "Remove a song from the queue",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - remove");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (!args[1]) return msg.channel.send(client.messages.provideASong);
            const pos = parseInt(args[1]);
            if (isNaN(pos)) return msg.channel.send(client.messages.validNumber);
            if (pos < 1) return msg.channel.send(client.messages.noSongs);
            if (pos < 0) return msg.channel.send(client.messages.noSongsInQueue);
            if (pos >= player.queue.songs.length)
                return msg.channel.send(
                    client.messages.queueLength.replace(
                        "%SONGS%",
                        (player.queue.songs.length - 1).toString()
                    )
                );
            msg.channel.send(
                client.messages.removed.replace("%SONG%", player.queue.songs[pos].title)
            );
            return player.remove(pos);
        }
    }
});

export default RemoveCommand;
