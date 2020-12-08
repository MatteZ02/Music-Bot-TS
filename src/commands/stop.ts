import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const StopCommand = new Command({
    name: "stop",
    alias: ["dc", "disconnect", "end", "leave", "fuckoff"],
    usage: "",
    description: "Stop the music.",
    onlyDev: false,
    permission: "MANAGE_CHANNELS",
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - stop");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (msg.content.includes("-force")) {
                if (player) {
                    player.voiceChannel.leave();
                }
                if (msg.guild?.voice?.channel) msg.guild.voice.channel.leave();
                client.player.delete(msg.guild?.id as string);
                return msg.channel.send(client.messages.stop);
            }
            if (!player || !player.data.playing) {
                return msg.channel.send(client.messages.noPlayer);
            }
            player.stop();
            msg.channel.send(client.messages.stop);
        }
    }
});

export default StopCommand;
