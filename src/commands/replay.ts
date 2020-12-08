import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const ReplayCommand = new Command({
    name: "replay",
    alias: ["rp"],
    usage: "",
    description: "Replay the currently playing song.",
    onlyDev: false,
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - replay");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            player.replay(0, args);
        }
    }
});

export default ReplayCommand;
