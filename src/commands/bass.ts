import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const BassCommand = new Command({
    name: "bass",
    alias: ["bassboost", "bb"],
    usage: "<bass>",
    description: "Boost the bass in your music!",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 3,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - bass");
        const player = client.player.get(msg.guild?.id as string);
        if (!args[1] && player)
            return msg.channel.send(`${client.messages.currentBass}**${player.modifiers.bass}**`);
        const bass = parseFloat(args[1]);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (isNaN(bass)) return msg.channel.send(client.messages.validNumber);
            if (bass > 30) return msg.channel.send(client.messages.maxBass);
            if (bass < 0) return msg.channel.send(client.messages.positiveBass);
            player.modifiers.bass = bass;
            if (!player.connection) throw new Error("No connection");
            player.replay((player.connection.dispatcher.streamTime + player.time) / 1000, args);
            return msg.channel.send(client.messages.bassApplied.replace("%BASS%", bass.toString()));
        }
    }
});

export default BassCommand;
