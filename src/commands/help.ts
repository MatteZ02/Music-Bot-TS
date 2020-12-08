import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const HelpCommand = new Command({
    name: "help",
    alias: [],
    usage: "<command(opt)>",
    description: "See the help for Musix.",
    onlyDev: false,
    category: "info",
    execute: (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - help");
        if (args[1]) {
            if (!client.commands.has(args[1])) {
                msg.channel.send("That command does not exist");
                return;
            } else {
                const command = client.commands.get(args[1]) as Command;

                const embed = new Discord.MessageEmbed()
                    .setTitle(`${process.env.BOT_PREFIX || "!"}${command.name} ${command.usage}`)
                    .setDescription(command.description)
                    .setFooter(
                        command.alias.length > 0
                            ? `${client.messages.helpCmdFooter} \`${command.alias.map(
                                  alias => `${alias}, `
                              )}\``
                            : "No available aliases"
                    )
                    .setColor(client.config.embedColor);
                msg.channel.send(embed);
            }
        } else {
            const categories = ["info", "music", "util"];
            let commands = "";
            for (let i = 0; i < categories.length; i++) {
                    commands += `**» ${categories[i].toUpperCase()}**\n${client.commands
                        .filter(command => command.category === categories[i])
                        .map(x => `\`${x.name}\``)
                        .join(", ")}\n`;
            }
            let message;
            message = client.messages.helpFooter.replace("%PREFIX%", process.env.BOT_PREFIX || "!");
            const embed = new Discord.MessageEmbed()
                .setTitle(`${client.user!.username} ${client.messages.helpTitle}`)
                .setDescription(`${commands}`)
                .setFooter(message)
                .setColor(client.config.embedColor);
            msg.channel.send(embed);
        }
    }
});

export default HelpCommand;
