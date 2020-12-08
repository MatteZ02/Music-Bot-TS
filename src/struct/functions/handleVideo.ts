import Client from "../../base/Client";
import Discord from "discord.js";
import Player from "../../base/Player";
import Song from "../classes/Song";

export default async function(
    resource: Song,
    msg: Discord.Message,
    voiceChannel: Discord.VoiceChannel,
    client: Client,
    playlist: boolean
): Promise<void> {
    client.log("function - handleVideo");
    let player = client.player.get(msg.guild?.id as string);

    if (player) {
        client.log("handleVideo - player exists adding song to queue");
        player.queue.songs.push(new Song(resource));
        player.textChannel = msg.channel as Discord.TextChannel;
        if (playlist) return;
        msg.channel.send(client.messages.songAdded.replace("%TITLE%", resource.title));
        return;
    }

    client.log("handleVideo - creating new player");
    player = new Player(
        msg.channel as Discord.TextChannel,
        voiceChannel,
        client
    );

    player.queue.songs.push(new Song(resource));

    client.log("handleVideo - setting player to client.player map");
    client.player.set(msg.guild?.id as string, player);

    await player.join(voiceChannel);
    player.play(0, true);
    return;
}
