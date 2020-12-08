import Player from "../base/Player";
import Client from "../base/Client";
import Discord from "discord.js";
import Song from "../struct/classes/Song";

export default function eventHandler(player: Player, client: Client, guild: Discord.Guild) {
    client.log("setting up event handler for player");
    player.on("error", err => {
        console.log(`${new Date().toUTCString()} | Player error`);
        console.error(err);
        player.textChannel.send(client.messages.error + err);
        if (player.error.amount == 0)
            player.error = {
                timeout: setTimeout(() => {
                    client.log("player error - clearTimeout");
                    if (player.error.timeout) clearTimeout(player.error.timeout);
                    player.error = { timeout: null, amount: 0 };
                }, 10000),
                amount: 1
            };
        else if (player.error.amount < 5) player.error.amount++;
        else {
            player.stop();
        }
    });
    player.on("start", () => {
        console.log(`${new Date().toUTCString()} | Player start`);
        player.voteData = { voters: [], votes: 0, votesNeeded: -1 };
        player.data.paused = false;
        player.data.playing = true;
        player.voteData = null;
    });
    player.on("end", async (reason: "end" | "skip" | "previous" | "finish" | "error") => {
        console.log(`${new Date().toUTCString()} | Player ended with reason: ${reason}`);
        player.data.playing = false;
        const nextFunc = async () => {
            client.log("player end - nextFunc");
            if (!player.data.songLooping) {
                client.log("nextFunc - not song looping");
                if (player.data.looping) player.queue.songs.push(player.queue.songs[0]);
                client.log("nextFunc - shifting and pushing to prevSongs");
                if (!player.data.looping)
                    player.queue.prevSongs.push(player.queue.songs.shift() as Song);
                client.log("nextFunc - checking autoPlay");
            }
            client.log("nextFunc - emit finish if no more songs");
            if (!player.queue.songs[0]) return player.emit("finish");
            client.log("nextFunc - play next song or looping song");
            player.play(0, true);
        };
        switch (reason) {
            case "end":
                nextFunc();
                break;
            case "skip":
                nextFunc();
                break;
            case "previous":
                player.play(0, true);
                break;
            case "finish":
                player.emit("finish");
                break;
            case "error":
                break;

            default:
                nextFunc();
                break;
        }
    });
    player.on("finish", () => {
        console.log(`${new Date().toUTCString()} | Player finished`);
        player.exists = false;
        player.voiceChannel.leave();
        client.log("deleting player");
        client.player.delete(guild.id);
    });
}
