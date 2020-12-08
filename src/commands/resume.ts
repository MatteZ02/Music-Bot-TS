import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const FrameCommand = new Command({
    name: "resume",
    alias: [],
    usage: "",
    description: "Resume the paused music",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - resume");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (!player.data.paused) return msg.channel.send(client.messages.notPaused);
            player.data.paused = false;
            if (player.connection) player.connection.dispatcher.resume();
            return msg.channel.send(client.messages.resumed);
        }
    }
});

export default FrameCommand;
