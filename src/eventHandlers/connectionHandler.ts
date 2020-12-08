import Client from "../base/Client";
import Discord from "discord.js";

export default function eventHandler(client: Client, connection: Discord.VoiceConnection): void {
    client.log("setting up event handler for voiceConnection");
    connection
        .on("error", error => {
            console.log(error);
        })
        .on("warn", warning => {
            console.log(`${new Date().toUTCString()} | VoiceConnection warning: ${warning}`);
        })
        .on("failed", error => {
            console.log(`${new Date().toUTCString()} | VoiceConnection failed`);
            console.error(error);
        })
        .on("newSession", () => {
            console.log(`${new Date().toUTCString()} | New voice session id received`);
        })
        .on("ready", () => {
            console.log(`${new Date().toUTCString()} | VoiceConnection ready`);
        })
        .on("reconnecting", () => {
            console.log(`${new Date().toUTCString()} | VoiceConnection reconnecting`);
        })
        .on("debug", message => {
            if (client.config.debug.voiceConnection) console.log(message);
        })
        .on("disconnect", () => {
            console.log(`${new Date().toUTCString()} | VoiceConnection disconnected`);
        })
        .on("authenticated", () => {
            console.log(`${new Date().toUTCString()} | VoiceConnection initiated`);
        });
}
