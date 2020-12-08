import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const VolumeCommand = new Command({
    name: "volume",
    alias: [],
    usage: "<volume>",
    description: "Change the volume of the music.",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - volume");
        const player = client.player.get(msg.guild?.id as string);
        if (!args[1] && player)
            return msg.channel.send(
                `${client.messages.currentVolume}**${player.modifiers.volume}**`
            );
        const volume = parseFloat(args[1]);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (isNaN(volume)) return msg.channel.send(client.messages.validNumber);
            if (volume > 100) return msg.channel.send(client.messages.maxVolume);
            if (volume < 0) return msg.channel.send(client.messages.positiveVolume);
            player.modifiers.volume = volume;
            player.setVolume(volume);
            return msg.channel.send(`${client.messages.setVolume}**${volume}**`);
        }
    }
});

export default VolumeCommand;
