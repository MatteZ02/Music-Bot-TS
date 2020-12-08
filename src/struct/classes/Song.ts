import ytdl from "ytdl-core";
import soundCloud from "soundcloud-scraper";

class Song {
    title: string;
    url: string;
    author: string;
    type: "ytsr" | "ytpl" | "ytdl" | "soundCloud";
    playerType: "ytdl" | "soundCloud";
    duration: number;
    channel: string;
    thumbnail: string;
    info: ytdl.videoInfo | soundCloud.Song | null;
    constructor(ops: Song) {
        this.title = ops.title;
        this.url = ops.url;
        this.author = ops.author;
        this.type = ops.type;
        this.playerType = ops.playerType;
        this.duration = ops.duration;
        this.channel = ops.channel;
        this.thumbnail = ops.thumbnail;
        this.info = ops.info;
    }
}

export default Song;
