import Discord from "discord.js";
import Client from "../../base/Client";

export default function voiceStateUpdate(
    oldState: Discord.VoiceState,
    newState: Discord.VoiceState,
    client: Client
): void {
    client.log("client event - voiceStateUpdate");
    if (!oldState.channel && oldState.member?.id === client.user?.id) {
        client.log("voiceStateUpdateHandler - setting self deaf");
        newState.setSelfDeaf(true);
        return;
    }
    const player = client.player.get(newState.guild.id);
    if (!player) return;
    if (
        !oldState.channel &&
        newState.channel == player.voiceChannel &&
        newState.channel.members.size == 2
    ) {
        if (player.timeout) {
            player.textChannel
                .send(client.messages.resumed)
                .then(message => message.delete({ timeout: 120000 }));
            player.connection?.dispatcher.resume();
            player.data.paused = false;
            player._deleteTimeout();
        }
    }
    if (
        (oldState.channel !== player.voiceChannel && newState.channel !== player.voiceChannel) ||
        !oldState.channel
    )
        return;
    let change = false;
    if (!player) return;
    if (newState.member?.id === client.user?.id && oldState.member?.id === client.user?.id) {
        if (!newState.channel) {
            client.log("voiceStateUpdateHandler - client disconnected");
            player._deleteTimeout();
            player.exists = false;
            client.player.delete(newState.guild.id);
            return;
        }
        if (newState.member?.voice.channel !== player.voiceChannel) {
            client.log("voiceStateUpdateHandler - voiceChannel changed (moved(");
            change = true;
            player.voiceChannel = newState.member?.voice.channel as Discord.VoiceChannel;
            player.connection = newState.connection;
        }
    }

    if (
        oldState.channel?.members.size === 1 ||
        (change && newState.channel && newState.channel?.members.size < 2)
    ) {
        client.log("voiceStateUpdateHandler - client left alone");
        player.textChannel
            .send(client.messages.leftAlonePaused)
            .then(message => message.delete({ timeout: 120000 }));
        player.connection?.dispatcher.pause(true);
        player.data.paused = true;
        player.timeout = setTimeout(() => {
            client.log("voiceStateUpdateHandler - timed out");
            if (!player || !player.connection?.dispatcher || !player.connection.dispatcher) return;
            if (player.voiceChannel.members.size === 1) {
                player.textChannel.send(client.messages.leftAlone);
                return player.stop();
            }
        }, 120000);
    }
}
