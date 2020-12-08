import Discord from "discord.js";
import { Command } from "../../base/Command";
import Client from "../../base/Client";

export default async function messageHandler(msg: Discord.Message, client: Client) {
    client.log("client event - message");
    if (!msg.guild) return;
    if (msg.author.bot && !client.tests) return;
    if (msg.author.bot && msg.author.id !== process.env.TESTBOT_ID) return;
    let prefix = process.env.BOT_PREFIX || "!"
    const args = msg.content.slice(prefix.length).split(" ");
    if (msg.channel instanceof Discord.TextChannel) {
        const permission = msg.channel.permissionsFor(client.user as Discord.ClientUser);
        if (!permission?.has("SEND_MESSAGES")) return;
    }
    if (msg.mentions.users.first()) {
        if (msg.mentions.users.first()?.id === client.user?.id) {
            client.log("messageHandler - mentioned");
            if (msg.guild.id === "583597555095437312" && !args[1])
                return msg.channel.send(`${client.messages.prefixHere}\`${prefix}\`.`);
            if (!args[1]) return;
            if (args[1] === "prefix") {
                if (!args[2])
                    return msg.channel.send(`${client.messages.prefixHere}\`${prefix}\`.`);
                if (args[2] === "=" && args[3]) return (prefix = args[3]);
            }
            args.shift();
            getCommand(client, args, msg);
        }
    }
    if (msg.content.startsWith(prefix)) getCommand(client, args, msg);
}

function getCommand(client: Client, args: string[], msg: Discord.Message) {
    client.log("messageHandler - get command");
    if (!args[0]) return;
    const commandName = args[0].toLowerCase();
    const command =
        client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName));
    if (!command) return;
    const rateLimit = client.rateLimits.get(msg.channel.id);
    if (rateLimit) return msg.channel.send(client.messages.rateLimited);
    if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps?.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) || 0 + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return msg.reply(
                `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
                    command.name
                }\` command.`
            );
        }
    }
    timestamps?.set(msg.author.id, now);
    setTimeout(() => timestamps?.delete(msg.author.id), cooldownAmount);
    exe(msg, args, client, command);
}

async function exe(
    msg: Discord.Message,
    args: string[],
    client: Client,
    command: Command
): Promise<void> {
    client.log("messageHandler - exe");
    const channel = msg.channel as Discord.TextChannel;
    const permissions = channel.permissionsFor(msg.client.user as Discord.User);
    if (!permissions?.has("EMBED_LINKS")) {
        msg.channel.send(client.messages.noPermsEmbed);
        return;
    }
    if (!permissions.has("USE_EXTERNAL_EMOJIS")) {
        msg.channel.send(client.messages.noPermsUseExternalEmojis);
        return;
    }
    client.log("messageHandler - executing command");
    try {
        command.execute(
            msg,
            args,
            client
        );
    } catch (err) {
        msg.reply(`${client.messages.errorExe} \`${err}\``);
        console.log(
            `${new Date().toUTCString()} | Error executing command`
        );
        console.error(err);
    }
}
