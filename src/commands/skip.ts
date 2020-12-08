import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";
import Player from "../base/Player";

const SkipCommand = new Command({
    name: "skip",
    alias: ["s", "next"],
    usage: "",
    description: "Skip or vote to skip the currently playing song",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 2,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - skip");
        const player = client.player.get(msg.guild?.id as string);
        if (!player || !player.data.playing) return msg.channel.send(client.messages.noPlayer);
        if (msg.member?.voice.channel !== player.voiceChannel)
            return msg.channel.send(client.messages.wrongVoiceChannel);
        if (args[1]) {
            if (await client.funcs.check(client, msg, args)) {
                let point = parseInt(args[1]);
                point = point - 1;
                if (isNaN(point)) return msg.channel.send(client.messages.validNumber);
                if (point > player.queue.songs.length - 1)
                    return msg.channel.send(client.messages.noSongs);
                if (point < 0) return msg.channel.send(client.messages.cantSkipToCurrent);
                player.skipto(point);
                msg.channel.send(client.messages.skipped);
            }
            return;
        }
        vote(player, msg, client);
    }
});

function vote(player: Player, msg: Discord.Message, client: Client): void {
    client.log("command - skip vote");
    if (!player.voteData) {
        player.voteData = {
            votes: 0,
            voters: [],
            votesNeeded: 0
        };
    }
    if (msg.member?.voice.deaf) {
        msg.channel.send(client.messages.deaf);
        return;
    }
    player.voteData.votesNeeded = Math.round(
        player.voiceChannel.members.filter(member => !member.user.bot).size / 2
    );
    if (player.voteData.votesNeeded < 2 && player.voiceChannel.members.size > 2)
        player.voteData.votesNeeded = 2;
    if (player.voiceChannel.members.size > 2) {
        if (player.voteData.voters.includes(msg.member?.id as string)) {
            msg.channel.send(client.messages.alreadyVoted);
            return;
        }
        player.voteData.votes++;
        player.voteData.voters.push(msg.member?.id as string);
        if (player.voteData.votes >= player.voteData.votesNeeded) {
            player.voteData = { voters: [], votes: 0, votesNeeded: -1 };
            msg.channel.send(client.messages.skipped);
            return player.skip();
        } else {
            msg.channel.send(
                `${client.messages.voted} \`${player.voteData.votes} / ${player.voteData.votesNeeded}\``
            );
            return;
        }
    } else {
        msg.channel.send(client.messages.skipped);
        return player.skip();
    }
}

export default SkipCommand;
