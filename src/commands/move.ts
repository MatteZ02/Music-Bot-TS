import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const MoveCommand = new Command({
    name: "move",
    alias: [],
    usage: "<Position to move from> <position to move to>",
    description: "Move a song within the queue.",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - move");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (!args[1] || !args[2]) return msg.channel.send(client.messages.moveUsage);
            const index1 = parseInt(args[1]);
            const index2 = parseInt(args[2]);
            if (isNaN(index1) || isNaN(index2))
                return msg.channel.send(client.messages.validNumber);
            if (index1 < 1 || index2 < 1) return msg.channel.send(client.messages.positiveMovePos);
            if (index1 <= index2) return msg.channel.send(client.messages.movePos);
            if (index1 > player.queue.songs.length || index2 > player.queue.songs.length) {
                const message = client.messages.queueLength.replace(
                    "%SONGS%",
                    player.queue.songs.length.toString()
                );
                return msg.channel.send(message);
            }
            player.queue.songs.splice(index2, 0, player?.queue.songs.slice(index1)[0]);
            msg.channel.send(
                `Moved \`${
                    player.queue.songs.splice(index1 + 1, 1)[0].title
                }\` from pos ${index1} to pos ${index2}`
            );
        }
    }
});

export default MoveCommand;
