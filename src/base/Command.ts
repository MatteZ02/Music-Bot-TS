import Discord from "discord.js";
import Client from "./Client";
import { CommandProps } from "../utils/typings";

export class Command {
    readonly name: string;
    readonly alias: string[];
    readonly usage: string;
    readonly description: string;
    readonly onlyDev: boolean;
    readonly permission?: Discord.PermissionString;
    readonly cooldown?: number;
    readonly category: "info" | "music" | "util";
    readonly execute: (
        msg: Discord.Message,
        args: string[],
        client: Client
    ) => void;
    constructor(commandProps: CommandProps) {
        this.name = commandProps.name;
        this.alias = commandProps.alias;
        this.usage = commandProps.usage;
        this.description = commandProps.description;
        this.onlyDev = commandProps.onlyDev;
        this.permission = commandProps.permission;
        this.cooldown = commandProps.cooldown;
        this.category = commandProps.category;
        this.execute = commandProps.execute;
    }
}
