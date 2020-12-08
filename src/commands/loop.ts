import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const LoopCommand = new Command({
    name: "loop",
    alias: ["repeat", "loopqueue", "lq", "queueloop"],
    usage: "",
    description: "loop the queue",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - loop");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (!player.data.looping) {
                player.data.looping = true;
                msg.channel.send(client.messages.looping);
            } else {
                player.data.looping = false;
                msg.channel.send(client.messages.noLooping);
            }
        }
    }
});

export default LoopCommand;
