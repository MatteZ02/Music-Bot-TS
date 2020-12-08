import Discord from "discord.js";
import SpotifyApi from "spotify-web-api-node";
import SoundCloud from "soundcloud-scraper";
import { Command } from "./Command";
import messages from "../config/messages";
import config from "../config/config";
import eventHandler from "../eventHandlers/clientEvents/eventHandler";

import check from "../struct/functions/check";
import evaluateBoolean from "../struct/functions/evaluateBoolean";
import handleVideo from "../struct/functions/handleVideo";
import msToTime from "../struct/functions/msToTime.js";
import timeToMs from "../struct/functions/timeToMs";

import Player from "./Player";

interface funcs {
    check: typeof check;
    evaluateBoolean: typeof evaluateBoolean;
    handleVideo: typeof handleVideo;
    msToTime: typeof msToTime;
    timeToMs: typeof timeToMs;
}

const GatewayIntents = new Discord.Intents();
GatewayIntents.add(
    1 << 0, // GUILDS
    1 << 7, // GUILD_VOICE_STATES
    1 << 9 // GUILD_MESSAGES
);

class Client extends Discord.Client {
    readonly logs: Array<string>;
    readonly messages = messages;
    readonly config = config;
    readonly funcs: funcs;
    public commands: Discord.Collection<string, Command>;
    readonly cooldowns: Discord.Collection<string, Discord.Collection<string, number>>;
    readonly player: Map<string, Player>;
    readonly rateLimits: Discord.Collection<string, NodeJS.Timeout>;
    readonly spotify: any;
    public soundCloud: SoundCloud.Client | null;
    readonly tests: boolean;
    constructor(
        public commandInfo: {
            commands: Discord.Collection<string, Command>;
        }
    ) {
        super({
            disableMentions: "everyone",
            messageCacheMaxSize: 10,
            messageCacheLifetime: 30,
            messageSweepInterval: 60,
            messageEditHistoryMaxSize: 0,
            retryLimit: 2,
            ws: {
                intents: GatewayIntents
            }
        });

        this.commands = commandInfo.commands;
        this.cooldowns = new Discord.Collection();
        this.rateLimits = new Discord.Collection();
        this.player = new Map();
        this.logs = [];

        this.spotify = new SpotifyApi({
            clientId: config.spotify_client_id,
            clientSecret: config.spotify_client_secret
        });

        this.soundCloud = null;

        this.funcs = {
            check,
            evaluateBoolean,
            handleVideo,
            msToTime,
            timeToMs
        };

        this.tests = process.env.TESTS ? true : false;

        eventHandler(this);

        this.log("BaseClient - Logging in");
        this.login(this.config.token).catch(err =>
            console.log(
                `${new Date().toUTCString()} | Failed to login: ${err}`
            )
        );
    }

    public log(info: string): void {
        this.emit("log", `${new Date().toUTCString()} | ${info}`);
    }
}

export default Client;
