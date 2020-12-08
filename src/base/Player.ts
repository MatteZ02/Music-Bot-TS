import { EventEmitter } from "events";
import Discord from "discord.js";
import ytdl from "ytdl-core";

import Streamer from "./Streamer";
import Client from "./Client";
import Song from "../struct/classes/Song";

import connectionHandler from "../eventHandlers/connectionHandler";
import dispatcherHandler from "../eventHandlers/dispatcherHandler";
import playerHandler from "../eventHandlers/playerHandler";

interface Queue {
    songs: Array<Song>;
    prevSongs: Array<Song>;
    awaitingSongs: Array<Song>;
}

interface PlayerStatusData {
    playing: boolean;
    paused: boolean;
    looping: boolean;
    songLooping: boolean;
}

interface VoteData {
    votes: number;
    voters: Array<string>;
    votesNeeded: number;
}

interface Modifiers {
    "3D": boolean;
    bass: number;
    flanger: boolean;
    nightCore: boolean;
    phaser: boolean;
    pulsator: boolean;
    reverse: boolean;
    treble: number;
    tremolo: boolean;
    vaporwave: boolean;
    vibrato: boolean;
    volume: number;
}

class Player extends EventEmitter {
    readonly client: Client;
    readonly guild: Discord.Guild;
    public textChannel: Discord.TextChannel;
    public voiceChannel: Discord.VoiceChannel;
    public connection: Discord.VoiceConnection | null;
    readonly streamer: Streamer;
    readonly queue: Queue;
    public modifiers: Modifiers;
    public data: PlayerStatusData;
    public voteData: VoteData | null;
    public time: number;
    public exists: boolean;
    private timer: NodeJS.Timeout | null;
    public timeout: NodeJS.Timeout | null;
    public error: { timeout: NodeJS.Timeout | null; amount: number };

    constructor(
        channel: Discord.TextChannel,
        voiceChannel: Discord.VoiceChannel,
        client: Client,
    ) {
        super();

        this.client = client;
        this.guild = channel.guild as Discord.Guild;

        this.textChannel = channel;
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.streamer = new Streamer(this, client);
        this.queue = {
            songs: [] as Array<Song>,
            prevSongs: [] as Array<Song>,
            awaitingSongs: [] as Array<Song>
        };
        this.modifiers = {
            "3D": false,
            bass: 1,
            flanger: false,
            nightCore: false,
            phaser: false,
            pulsator: false,
            reverse: false,
            treble: 0,
            tremolo: false,
            vaporwave: false,
            vibrato: false,
            volume: 50
        };
        this.data = {
            playing: false,
            paused: false,
            looping: false,
            songLooping: false
        };
        this.voteData = null;
        this.time = 0;
        this.exists = true;
        this.timer = null;
        this.timeout = null;
        this.error = { timeout: null, amount: 0 };

        playerHandler(this, client, voiceChannel.guild);
        this.client.log("BasePlayer - Initialized");
    }

    public async play(seek: number, play: boolean): Promise<void> {
        this.client.log("BasePlayer - play");
        this._deleteTimeout();
        this.client.log("BasePlayer - Timeout initialized");
        this.timer = setTimeout(() => {
            this.client.log("BasePlayer - Timeout");
            if (this.exists) {
                this.client.log("BasePlayer - Stopping due to Timing out");
                this.textChannel.send(this.client.messages.tookTooLong);
                this.voiceChannel.leave();
                if (this.connection && this.connection.dispatcher)
                    this.connection?.dispatcher.destroy();
                this.client.player.delete(this.guild.id);
                return;
            }
        }, 30000);

        if (this.connection?.dispatcher) this.connection.dispatcher.destroy();
        this.client.log("BasePlayer - Getting stream from streamer");
        const stream = this.streamer.stream({ seek: seek });
        this.streamer.on("error", err => {
            console.log(`${new Date().toUTCString()} | BasePlayer streamer error`);
            console.error(err);
            if (err.includes("429")) {
                this.client.log("BasePlayer - ytdl ratelimit error. Stopping");
                this.textChannel.send(this.client.messages.error + err);
                this.stop();
            }
            this.skip();
            this.textChannel.send(this.client.messages.videoUnavailable);
            this.emit("error", err);
        });

        this.client.log("BasePlayer - Initializing dispatcher");
        const dispatcher = this.connection?.play(
            await stream,
            this.client.config.streamConfig.options as Discord.StreamOptions
        );

        dispatcherHandler(this.client, dispatcher as Discord.StreamDispatcher, this.guild);
        this.client.log("BasePlayer - Sending startPlaying embed");
        const embed = new Discord.MessageEmbed()
            .setTitle(`${this.client.messages.startPlaying}**${this.queue.songs[0].title}**`)
            .setDescription(
                `Song duration: \`${this.client.funcs.msToTime(
                    this.queue.songs[0].duration == 0 ? `Livestream` : this.queue.songs[0].duration,
                    "hh:mm:ss"
                )}\``
            )
            .setColor(this.client.config.embedColor);
        this.textChannel.send(embed);

        this.client.log("BasePlayer - Playing started");
    }

    public async join(voiceChannel: Discord.VoiceChannel): Promise<Discord.VoiceConnection | null> {
        this.client.log("BasePlayer - join");
        try {
            this.voiceChannel = voiceChannel;
            this.client.log("BasePlayer - attempting to join voiceChannel");
            this.connection = await this.voiceChannel.join();
            connectionHandler(this.client, this.connection);
            return this.connection;
        } catch (error) {
            this.client.player.delete(voiceChannel.guild?.id as string);
            console.log(`${new Date().toUTCString()} | Failed obtain voiceConnection`);
            console.error(error);
            this.textChannel.send(this.client.messages.error);
            return null;
        }
    }

    public remove(pos: number): Song[] {
        this.client.log("BasePlayer - remove");
        return this.queue.songs.splice(pos, 1);
    }

    public shuffle(): void {
        this.client.log("BasePlayer - shuffle");
        for (let i = this.queue.songs.length - 1; i > 1; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (i === 0 || j === 0) {
                // j or i is 0 so we don't do anything
            } else {
                [this.queue.songs[i], this.queue.songs[j]] = [
                    this.queue.songs[j],
                    this.queue.songs[i]
                ];
            }
        }
    }

    public setVolume(multiplier: number) {
        this.client.log("BasePlayer - setVolume");
        this.streamer.setVolume(multiplier / 100);
    }

    public replay(seek: number, args: string[]): void {
        this.client.log("BasePlayer - replay");
        this._cleanup();
        this._deleteTimeout();
        const command =
            this.client.commands.get(args[0]) ||
            this.client.commands.find(cmd => cmd.alias && cmd.alias.includes(args[0]));
        if (!this || !this.connection) return;
        command?.name === "seek"
            ? (this.time = seek * 1000)
            : (this.time += this.connection.dispatcher.streamTime);

        this.play(seek, false);
    }

    public skip(): void {
        this.client.log("BasePlayer - skip");
        this._cleanup();
        this._deleteTimeout();
        this.time = 0;
        this.end("skip");
    }

    public skipto(point: number): void {
        this.client.log("BasePlayer - skipto");
        for (let i = 0; i < point; i++) {
            this.queue.prevSongs.push(this.queue.songs.shift() as Song);
        }
        this.skip();
    }

    public end(reason: "end" | "skip" | "previous" | "finish" | "error"): void {
        this.client.log("BasePlayer - end");
        this.connection?.dispatcher?.destroy();
        this.streamer.end();
        this.emit("end", reason);
    }

    public stop(): void {
        this.client.log("BasePlayer - stop");
        this._cleanup();
        this._deleteTimeout();
        this.queue.songs = [];
        this.data.looping = false;
        this.connection?.dispatcher?.destroy();
        this.end("finish");
    }

    public previous(): void {
        this.client.log("BasePlayer - previous");
        this._cleanup();
        this._deleteTimeout();
        this.queue.songs.unshift(this.queue.prevSongs.pop() as Song);
        this.end("previous");
    }

    public async autoplay(): Promise<void> {
        this.client.log("BasePlayer - autoplay");
        this._cleanup();
        if (this.connection?.dispatcher) this.connection.dispatcher.destroy();
        this.client.log("BasePlayer - getting song from previous songs");
        const query = this.queue.prevSongs[
            Math.floor(Math.random() * Math.floor(this.queue.prevSongs.length))
        ];
        if (!query) {
            this.emit("finish");
            return;
        }
        const info = await ytdl.getInfo(query.url);
        const random = Math.floor(Math.random() * Math.floor(info.related_videos.length));
        this.client.log("BasePlayer - adding related song to queue");
        this.queue.songs.push(
            new Song({
                title: Discord.Util.escapeMarkdown(info.related_videos[random].title as string),
                url: `https://www.youtube.com/watch?v=${info.related_videos[random].id}`,
                author: this.client.user?.tag as string,
                type: "ytdl",
                playerType: "ytdl",
                duration: (info.related_videos[random].length_seconds || 0) * 1000,
                channel: info.related_videos[random].author as string,
                thumbnail: info.related_videos[random].video_thumbnail as string,
                info: null
            })
        );
        this.play(0, true);
    }

    public _deleteTimeout(): void {
        this.client.log("BasePlayer - deleteTimeout");
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    private _cleanup(): void {
        this.client.log("BasePlayer - cleanup");
        this.streamer.removeAllListeners();
    }
}

export default Player;
