import Client from "../../base/Client";

import ready from "./ready";
import message from "./msg";
import voiceStateUpdate from "./voiceStateUpdate";

export default function eventHandler(client: Client) {
    client.log("setting up event handler for client");
    client
        .on("ready", () => {
            ready(client);
        })
        .on("message", msg => {
            message(msg, client);
        })
        .on("voiceStateUpdate", (oldState, newState) => {
            voiceStateUpdate(oldState, newState, client);
        })
        .on("error", err => {
            console.log(`${new Date().toUTCString()} | Shard: ${client.shard?.ids} | Client error`);
            console.error(err);
        })
        .on("debug", info => {
            if (client.config.debug.client) console.log(info);
        })
        .on("log", info => {
            if (client.config.debug.code) console.log(info);
        })
        .on("invalidated", () => {
            console.log(
                `${new Date().toUTCString()} | Shard: ${
                    client.shard?.ids
                } | Client session invalidated. Exiting the process!`
            );
            process.exit(1);
        })
        /*.on("rateLimit", rateLimitInfo => {
            console.log(rateLimitInfo);
            const rateLimitPath = rateLimitInfo.path.split("/");
            const channel = client.channels.cache.get(rateLimitPath[2]) as
                | Discord.TextChannel
                | Discord.DMChannel;
            const oldRateLimit = client.rateLimits.get(rateLimitPath[2]);
            if (oldRateLimit) clearTimeout(oldRateLimit);
            if (!channel) return;
            const timeOut = setTimeout(() => {
                client.rateLimits.delete(channel.id);
            }, rateLimitInfo.timeout);
            client.rateLimits.set(channel.id, timeOut);
        })*/
        .on("shardDisconnect", (event, id) => {
            client.logs.push(`Shard ${id} disconnected event ${event}`);
        })
        .on("shardError", (error, shardId) => {
            client.logs.push(`Shard ${shardId} error ${error}`);
        })
        .on("shardReady", id => {
            client.logs.push(`Shard ${id} ready.`);
        })
        .on("shardReconnecting", id => {
            client.logs.push(`shard ${id} reconnecting.`);
        })
        .on("shardResume", (id, replayedEvents) => {
            client.logs.push(`shard ${id} resume events ${replayedEvents}`);
        })
        .on("warn", info => {
            client.logs.push(`Warn! info: ${info}`);
            console.log(
                `${new Date().toUTCString()} | Shard: ${
                    client.shard?.ids
                } | Client warning: ${info}`
            );
        });
}
