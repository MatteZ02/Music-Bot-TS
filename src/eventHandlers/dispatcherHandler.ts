import Client from "../base/Client";
import Discord from "discord.js";

export default function eventHandler(
    client: Client,
    dispatcher: Discord.StreamDispatcher,
    guild: Discord.Guild
): void {
    client.log("setting up event handler for dispatcher");
    const player = client.player.get(guild.id);
    if (!player) return;
    dispatcher
        .on("finish", () => {
            console.log(`${new Date().toUTCString()} | Dispatcher finish`);
            player.end("end");
        })
        .on("start", () => {
            console.log(`${new Date().toUTCString()} | Dispatcher start`);
            player._deleteTimeout();
            player.emit("start");
        })
        .on("error", error => {
            console.log(`${new Date().toUTCString()} | Dispatcher error`);
            console.error(error);
            player.end("error");
            return player?.textChannel.send(client.messages.errorDispatcher + `\`${error}\``);
        })
        .on("debug", info => {
            if (client.config.debug.dispatcher) console.log(info);
        });
}
