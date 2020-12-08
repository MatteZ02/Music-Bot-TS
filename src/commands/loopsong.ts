import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const LoopSongCommand = new Command({
    name: "loopsong",
    alias: ["repeatsong"],
    usage: "",
    description: "loop the currently playing song",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - loopsong");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            if (!player.data.songLooping) {
                player.data.songLooping = true;
                msg.channel.send(
                    client.messages.loopingSong.replace("%TITLE%", player.queue.songs[0].title)
                );
            } else {
                player.data.songLooping = false;
                msg.channel.send(client.messages.noLoopingSong);
            }
        }
    }
});

export default LoopSongCommand;
