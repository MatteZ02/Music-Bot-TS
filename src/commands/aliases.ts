import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const AliasesCommand = new Command({
    name: "aliases",
    alias: [],
    usage: "",
    description: "See all available command aliases",
    onlyDev: false,
    category: "info",
    execute: (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - aliases");
        const commands = client.commands.filter(
            command => command.alias.length > 0 && !command.onlyDev
        );
        const embed = new Discord.MessageEmbed()
            .setTitle("Command aliases")
            .setDescription(
                commands.map(
                    command =>
                        `${command.name}: \`${command.alias.map(alias => alias).join(", ")}\``
                )
            )
            .setColor(client.config.embedColor);
        msg.channel.send(embed);
    }
});

export default AliasesCommand;
