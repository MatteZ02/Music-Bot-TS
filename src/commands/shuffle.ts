import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const ShuffleCommand = new Command({
    name: "shuffle",
    alias: [],
    usage: "",
    description: "Shuffle the queue",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - shuffle");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            player.shuffle();
            msg.channel.send(client.messages.shuffled);
        }
    }
});

export default ShuffleCommand;
