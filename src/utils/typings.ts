import Discord from "discord.js";
import ytdl from "ytdl-core";
import Client from "../base/Client";

export interface CommandProps {
    name: string;
    alias: string[];
    usage: string;
    description: string;
    onlyDev: boolean;
    permission?: Discord.PermissionString;
    cooldown?: number;
    category: "info" | "music" | "util";
    execute: (msg: Discord.Message, args: string[], client: Client) => void;
}

export interface streamOptions extends ytdl.downloadOptions {
    seek: number;
}
