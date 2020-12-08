import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const SkipToCommand = new Command({
    name: "skipto",
    alias: ["st"],
    usage: "<point in queue>",
    description: "Skip to a point in the queue",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 3,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - skipto");
        const command =
            client.commands.get(args[0]) ||
            client.commands.find(cmd => cmd.alias && cmd.alias.includes(args[0]));
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (!args[1])
                return msg.channel.send(`${client.messages.correctUsage}\`${command?.usage}\``);
            let point = parseInt(args[1]);
            point = point - 1;
            if (isNaN(point)) return msg.channel.send(client.messages.validNumber);
            if (point > player.queue.songs.length - 1)
                return msg.channel.send(client.messages.noSongs);
            if (point < 0) return msg.channel.send(client.messages.cantSkipToCurrent);
            player.skipto(point);
            msg.channel.send(client.messages.skipped);
        }
    }
});

export default SkipToCommand;
