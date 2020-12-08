import Client from "../../base/Client";
import Discord from "discord.js";

export default async function(
    client: Client,
    msg: Discord.Message,
    args: string[]
): Promise<boolean> {
    client.log("function - check");
    const command =
        client.commands.get(args[0]) ||
        client.commands.find(cmd => cmd.alias && cmd.alias.includes(args[0]));
    const player = client.player.get(msg.guild?.id as string);
    if (msg.channel instanceof Discord.TextChannel) {
        client.log("check - textChannel");
        const permissions = msg.channel.permissionsFor(msg.author);
        if (!player || (!player.data.playing && command?.name !== "stop")) {
            client.log("check - no player");
            msg.channel.send(client.messages.noPlayer);
            return false;
        }
        if (msg.member?.voice.channel !== player.voiceChannel) {
            client.log("check - wrong channel");
            msg.channel.send(client.messages.wrongVoiceChannel);
            return false;
        }
        client.log("check - under 3 members");
        if (msg.member?.voice.channel?.members.size < 3) return true;
        client.log("check - permissions true");
        if (!command?.permission) throw "no permissions declared for this command"
        if (!permissions?.has(command.permission)) {
            client.log("check - no perms");
            msg.channel.send(client.messages.noPerms.replace("%PERMS%", command.permission));
            return false;
        } else return true;
    } else return false;
}
