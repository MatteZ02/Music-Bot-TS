import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const PauseCommand = new Command({
    name: "pause",
    alias: [],
    usage: "",
    description: "pause the currently playing song",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - pause");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (player.data.paused) return msg.channel.send(client.messages.alreadyPaused);
            player.data.paused = true;
            player.connection?.dispatcher.pause(true);
            return msg.channel.send(client.messages.paused);
        }
    }
});

export default PauseCommand;
