import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const previousCommand = new Command({
    name: "previous",
    alias: ["prev", "return", "back"],
    usage: "",
    description: "Play the previous song.",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - previous");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (player.queue.prevSongs.length < 1)
                return msg.channel.send(client.messages.noPreviousSongs);
            player.previous();
            msg.channel.send(client.messages.previousSong);
        }
    }
});

export default previousCommand;
