import { EventEmitter } from "events";
import ytdl from "ytdl-core";
import prism from "prism-media";
import soundCloud from "soundcloud-scraper";
import { Readable } from "stream";
import Player from "./Player";
import Client from "./Client";

interface options {
    seek: number;
}

interface streams {
    opus: prism.opus.Encoder | null;
    volume: prism.VolumeTransformer | null;
    ffmpeg: prism.FFmpeg | null;
}

class Streamer extends EventEmitter {
    private player: Player;
    private client: Client;
    private input: Readable | null;
    readonly streams: streams;
    constructor(player: Player, client: Client) {
        super();
        this.player = player;
        this.client = client;
        this.input = null;
        this.streams = { opus: null, volume: null, ffmpeg: null };
        this.on("error", () => this._destroy());

        this.streams.opus?.on("end", () => this._destroy());
        this.streams.ffmpeg?.on("end", () => this._destroy());
    }
    public async stream(options: options): Promise<prism.opus.Encoder> {
        this.client.log("streamer - stream");
        this.input = this._getInputStream();

        this.input.on("error", err => this.emit("error", err));

        this.client.log("streamer - configure args");

        const args = this._getFFmpegArgs();

        args.unshift("-ss", String(options.seek));

        this.client.log("streamer - creating a new instance of FFmpeg");
        this.streams.ffmpeg = new prism.FFmpeg({ args });

        this.client.log("streamer - piping input to FFmpeg");
        const output = this.input.pipe(this.streams.ffmpeg);
        output.on("close", () => this._destroy());

        return this._playPCMStream(output);
    }

    private _playPCMStream(FFmpeg: prism.FFmpeg): prism.opus.Encoder {
        this.client.log("streamer - playPCMStream");
        this.client.log("streamer - create new opus encoder");
        this.streams.opus = new prism.opus.Encoder({
            channels: 2,
            rate: 48000,
            frameSize: 960
        });

        this.client.log("streamer - create new volumeTransformer");
        this.streams.volume = new prism.VolumeTransformer({
            type: "s16le",
            volume: this.player.modifiers.volume / 100
        });
        this.client.log(
            "streamer - piping FFmpeg to volumeTransformer and piping that to opus encoder"
        );
        //@ts-ignore
        const transcoder = FFmpeg.pipe(this.streams.volume).pipe(this.streams.opus);
        transcoder.on("close", () => this._destroy());
        return this.streams.opus;
    }

    private _getInputStream(): Readable {
        this.client.log("streamer - getInputStream");
        switch (this.player.queue.songs[0].playerType) {
            case "ytdl":
                this.client.log("streamer - downloading using ytdl");
                return this.player.queue.songs[0].info
                    ? ytdl.downloadFromInfo(
                          this.player.queue.songs[0].info as ytdl.videoInfo,
                          this.client.config.streamConfig.ytdlOptions as ytdl.downloadOptions
                      )
                    : ytdl(
                          this.player.queue.songs[0].url,
                          this.client.config.streamConfig.ytdlOptions as ytdl.downloadOptions
                      );

            case "soundCloud":
                this.client.log("streamer - downloading using soundCloud");
                if (this.player.queue.songs[0].info instanceof soundCloud.Song)
                    return this.player.queue.songs[0].info?.downloadProgressive(
                        this.player.queue.songs[0].url
                    );

            default:
                throw "Invalid playerType";
        }
    }

    private _getFFmpegArgs(): string[] {
        this.client.log("streamer - getFFmpegArgs");
        const args = [
            "-reconnect",
            "1",
            "-reconnect_streamed",
            "1",
            "-reconnect_delay_max",
            "5",
            "-analyzeduration",
            "0",
            "-loglevel",
            "0",
            "-f",
            "s16le",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-af",
            `bass=g=${this.player.modifiers.bass},treble=g=${this.player.modifiers.treble}`
        ];

        if (this.player.modifiers["3D"])
            args.push("-af", "apulsator=hz=0.2:mode=triangle:offset_l=0.1");

        if (this.player.modifiers.flanger)
            args.push("-af", "flanger=interp=quadratic:phase=100:speed=10");

        if (this.player.modifiers.nightCore)
            args.push("-af", "aresample=48000,asetrate=48000*1.25");

        if (this.player.modifiers.phaser) args.push("-af", "aphaser=in_gain=0.4");

        if (this.player.modifiers.pulsator) args.push("-af", "apulsator=hz=1:offset_l=0.1");

        if (this.player.modifiers.reverse) args.push("-af", "areverse");

        if (this.player.modifiers.tremolo) args.push("-af", "tremolo");

        if (this.player.modifiers.vaporwave) args.push("-af", "aresample=48000,asetrate=48000*0.8");

        if (this.player.modifiers.vibrato) args.push("-af", "vibrato=f=6.5");

        return args;
    }

    public end(): void {
        this.client.log("Streamer - end");
        this.streams.opus?.end();
        this.streams.ffmpeg?.end();
    }

    private _destroy(): void {
        this.client.log("Streamer - destroy");
        this.input?.destroy();
        //@ts-ignore
        this.streams.volume?.destroy();
        this.streams.opus?.destroy();
        this.streams.ffmpeg?.destroy();
    }

    public setVolume(level: number): void {
        this.client.log("Streamer - setVolume");
        this.streams.volume?.setVolume(level);
    }
}

export default Streamer;
