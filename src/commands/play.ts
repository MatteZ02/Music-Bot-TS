import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";
import ytsr from "ytsr";
import ytpl from "ytpl";
import ytdl from "ytdl-core";

const PlayCommand = new Command({
    name: "play",
    alias: ["p"],
    usage: "<song name>",
    description: "Play some music",
    onlyDev: false,
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - play");
        const searchString = args.slice(1).join(" ");
        const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
        const player = client.player.get(msg.guild?.id as string);
        const voiceChannel = msg.member?.voice.channel;
        if (!player) {
            if (!msg.member?.voice.channel) return msg.channel.send(client.messages.noVoiceChannel);
        } else {
            if (voiceChannel !== player.voiceChannel)
                return msg.channel.send(client.messages.wrongVoiceChannel);
        }
        if (!args[1]) return msg.channel.send(client.messages.noQuery);
        if (voiceChannel?.full && !player) return msg.channel.send(client.messages.channelFull);
        if (!voiceChannel?.joinable && !player)
            return msg.channel.send(client.messages.noPermsConnect);
        if (!voiceChannel?.speakable && !player)
            return msg.channel.send(client.messages.noPermsSpeak);
        if (!voiceChannel) return;
        if (ytdl.validateURL(url)) {
            client.log("command - play received ytdl url");
            const info = await ytdl.getInfo(url);
            client.funcs.handleVideo(
                {
                    title: info.videoDetails.title,
                    url,
                    author: msg.author.tag,
                    type: "ytdl",
                    playerType: "ytdl",
                    duration: parseInt(info.videoDetails.lengthSeconds) * 1000,
                    channel: info.videoDetails.author.name,
                    thumbnail: info.videoDetails.thumbnail.thumbnails[0].url,
                    info: info
                },
                msg,
                voiceChannel,
                client,
                false
            );
        } else if (url.match(/^https?:\/\/(open.spotify.com|spotify.com)(.*)$/)) {
            client.log("command - play received spotify url");
            switch (url.split("/")[3]) {
                case "playlist":
                    const playlistId = url.split("/playlist/")[1].split("?")[0];
                    const playlistData = await client.spotify
                        .getPlaylist(playlistId)
                        .catch((err: any) => {
                            msg.channel.send(client.messages.error + err);
                            console.log(`${new Date().toUTCString()} | Error whilst getting spotify playlist: ${err}`);
                        });
                    const loadingPlaylistMsg = await msg.channel.send(client.messages.loadingSongs);
                    for (const item of playlistData.body.tracks.items) {
                        await searchSong(
                            { artist: item.track.artists[0].name, name: item.track.name },
                            client,
                            msg,
                            voiceChannel,
                            true
                        );
                        loadingPlaylistMsg.edit(
                            client.messages.playlistAdded.replace("%TITLE%", playlistData.body.name)
                        );
                    }
                    break;

                case "album":
                    const loadingAlbumMsg = await msg.channel.send(client.messages.loadingSongs);
                    const albumId = url.split("/album/")[1].split("?")[0];
                    const album = await client.spotify.getAlbum(albumId).catch((err: any) => {
                        msg.channel.send(client.messages.error + err);
                        console.log(`${new Date().toUTCString()} | Error whilst getting spotify albym: ${err}`);
                    });
                    const albumData = await client.spotify
                        .getAlbumTracks(albumId)
                        .catch((err: any) => {
                            msg.channel.send(client.messages.error + err);
                            console.log(`${new Date().toUTCString()} | Error whilst getting spotify album tracks: ${err}`);
                        });
                    for (const item of albumData.body.items) {
                        await searchSong(
                            { artist: item.artists[0].name, name: item.name },
                            client,
                            msg,
                            voiceChannel,
                            true
                        );
                    }
                    loadingAlbumMsg.edit(
                        client.messages.albumAdded.replace("%TITLE%", album.body.name)
                    );
                    break;

                case "track":
                    const trackId = url.split("/track/")[1].split("?")[0];
                    const trackData = await client.spotify.getTrack(trackId).catch((err: any) => {
                        msg.channel.send(client.messages.error + err);
                        console.log(`${new Date().toUTCString()} | Error whilst getting spotify track: ${err}`);
                    });
                    await searchSong(trackData.body, client, msg, voiceChannel, false);
                    break;

                case "artist":
                    const loadingArtistTopTracksMsg = await msg.channel.send(
                        client.messages.loadingSongs
                    );
                    const artistId = url.split("/artist/")[1].split("?")[0];
                    const artistTopTracksData = await client.spotify
                        .getArtistTopTracks(artistId, "US")
                        .catch((err: any) => {
                            console.log(`${new Date().toUTCString()} | Error getting spotify artist top tracks: ${err}`);
                        });
                    const artistData = await client.spotify
                        .getArtist(artistId)
                        .catch((err: any) =>
                            console.log(`${new Date().toUTCString()} | Error getting spotify artist data: ${err}`));
                    for (const item of artistTopTracksData.body.tracks) {
                        await searchSong(
                            { artist: item.artists[0].name, name: item.name },
                            client,
                            msg,
                            voiceChannel,
                            true
                        );
                    }
                    loadingArtistTopTracksMsg.edit(
                        client.messages.topTracks.replace("%NAME%", artistData.body.name)
                    );
                    break;

                default:
                    msg.channel.send(client.messages.invalidSpotifyUrl);
                    break;
            }
        } else if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            client.log("command - play received youtube playlist url");
            const lmsg = await msg.channel.send(client.messages.loadingSongs);
            const playlist = await ytpl(url, { limit: Infinity }).catch((err: any) => {
                msg.channel.send(client.messages.error + err);
                console.error("Error whilst getting playlist " + err);
            });
            if (!playlist || !playlist.items) return msg.channel.send(client.messages.noResults);
            for (let i = 0; i < playlist.items.length; i++) {
                client.funcs.handleVideo(
                    {
                        title: playlist.items[i].title,
                        url: playlist.items[i].url_simple,
                        author: msg.author.tag,
                        type: "ytpl",
                        playerType: "ytdl",
                        duration: client.funcs.timeToMs(playlist.items[i].duration || 0),
                        channel: playlist.items[i].author?.name || "unknown",
                        thumbnail: playlist.items[i].thumbnail,
                        info: null
                    },
                    msg,
                    voiceChannel,
                    client,
                    true
                );
            }
            return lmsg.edit(client.messages.playlistAdded.replace("%TITLE%", playlist.title));
        } else if (url.match(/^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/)) {
            client.log("command - play received soundcloud url");
            const track = await client.soundCloud?.getSongInfo(url);
            if (!track) return msg.channel.send(client.messages.noResults);
            client.funcs.handleVideo(
                {
                    title: track.title,
                    url: track.url,
                    author: msg.author.tag,
                    type: "soundCloud",
                    playerType: "soundCloud",
                    duration: track.duration,
                    channel: track.author.name,
                    thumbnail: track.thumbnail,
                    info: track
                },
                msg,
                voiceChannel,
                client,
                false
            );
        } else {
            if (searchString.length > 127) return msg.channel.send(client.messages.noResults);
            const res = await ytsr(searchString, {
                limit: 10
            }).catch((err: any) => {
                msg.channel.send(client.messages.error + err);
                console.log(`${new Date().toUTCString()} | Error whilst ytsr: ${err}`);
            });
            if (!res || !res.items[0]) return msg.channel.send(client.messages.noResults);
            const videoResults = res.items.filter(
                (item: ytsr.Item) => item && item.type == "video"
            ) as Array<ytsr.Video>;
            client.funcs.handleVideo(
                {
                    title: videoResults[0].title,
                    url: videoResults[0].link,
                    author: msg.author.tag,
                    type: "ytsr",
                    playerType: "ytdl",
                    duration: client.funcs.timeToMs(videoResults[0].duration || 0),
                    channel: videoResults[0].author.name,
                    thumbnail: videoResults[0].thumbnail,
                    info: null
                },
                msg,
                voiceChannel,
                client,
                false
            );
        }
    }
});

async function searchSong(
    track: { artist: string; name: string },
    client: Client,
    msg: Discord.Message,
    voiceChannel: Discord.VoiceChannel,
    playlist: boolean
): Promise<void> {
    client.log("command - play searchSong");
    const res = await ytsr(`${track.name} ${track.artist}`, {
        limit: 5
    }).catch((err: any) => {
        msg.channel.send(client.messages.error + err);
        console.log(`${new Date().toUTCString()} | Error whilst ytsr: ${err}`);
    });
    if (!res) {
        msg.channel.send(client.messages.noResults);
        return;
    }
    const videoResults = res.items.filter(item => item && item.type === "video") as Array<
        ytsr.Video
    >;
    if (!videoResults[0]) {
        msg.channel.send(client.messages.noResults);
        return;
    }
    client.funcs.handleVideo(
        {
            title: videoResults[0].title,
            url: videoResults[0].link,
            author: msg.author.tag,
            type: "ytsr",
            playerType: "ytdl",
            duration: client.funcs.timeToMs(videoResults[0].duration || 0),
            channel: videoResults[0].author.name,
            thumbnail: videoResults[0].thumbnail,
            info: null
        },
        msg,
        voiceChannel,
        client,
        playlist
    );
}

export default PlayCommand;
