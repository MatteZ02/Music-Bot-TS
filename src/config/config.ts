import Discord from "discord.js";
import { streamOptions } from "../utils/typings";
import * as dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "../../.env" });

export default {
    token: process.env.DISCORD_TOKEN,
    sc_api_key: process.env.SOUNDCLOUD_API_KEY,
    spotify_access_key: process.env.SPOTIFY_ACCESS_KEY,
    spotify_client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    spotify_client_id: process.env.SPOTIFY_CLIENT_ID,
    spotify_refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
    embedColor: "#0095ff",
    debug: {
        code: true,
        client: false,
        dispatcher: false,
        voiceConnection: false
    },
    streamConfig: {
        ytdlOptions: ({
            filter: "audio",
            highWaterMark: 1 << 25,
        } as unknown) as streamOptions,
        options: {
            bitrate: 1024,
            volume: false,
            type: "opus"
        } as Discord.StreamOptions
    },
};
