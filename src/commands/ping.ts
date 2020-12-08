import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const PingCommand = new Command({
    name: "ping",
    alias: [],
    usage: "",
    description: "See the current ping for Musix",
    onlyDev: false,
    category: "info",
    execute: (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - ping");
        msg.channel.send(client.messages.pinging).then(m => {
            const latency = m.createdTimestamp - msg.createdTimestamp;
            const embed = new Discord.MessageEmbed()
                .addField(client.messages.ping, client.ws.ping, true)
                .addField(client.messages.latency, latency, true)
                .setColor(client.config.embedColor);
            m.delete();
            msg.channel.send(embed);
        });
    }
});

export default PingCommand;
