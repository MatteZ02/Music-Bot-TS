import Discord from "discord.js";
import { Command } from "../base/Command";

import Commands from "../commands/index";

export function getCommands(): { commands: Discord.Collection<string, Command> } {
    const commands = new Discord.Collection<string, Command>();

    for (const command of Commands) {
        commands.set(command.name, command);
    }

    return { commands };
}
