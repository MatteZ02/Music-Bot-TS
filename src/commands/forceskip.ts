import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const ForceSkipCommand = new Command({
    name: "forceskip",
    alias: ["fs"],
    usage: "",
    description: "forcefully skip the currently playing song",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - forceskip");
        const player = client.player.get(msg.guild?.id as string);
        if (!player || !player.data.playing) return msg.channel.send(client.messages.noPlayer);
        if (msg.member?.voice.channel !== player.voiceChannel)
            return msg.channel.send(client.messages.wrongVoiceChannel);
        if (await client.funcs.check(client, msg, args)) {
            msg.channel.send(client.messages.skipped);
            return player.skip();
        }
    }
});

export default ForceSkipCommand;
