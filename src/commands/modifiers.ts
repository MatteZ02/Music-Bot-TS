import { Command } from "../base/Command";
import Discord from "discord.js";
import Client from "../base/Client";

const ModifiersCommand = new Command({
    name: "modifiers",
    alias: ["mod"],
    usage: "<modifier> <value(opt)>",
    description: "Manage the audio modifiers!",
    onlyDev: false,
    permission: "MANAGE_MESSAGES",
    cooldown: 3,
    category: "music",
    execute: async (msg: Discord.Message, args: string[], client: Client) => {
        client.log("command - modifiers");
        const player = client.player.get(msg.guild?.id as string);
        if (await client.funcs.check(client, msg, args)) {
            if (!player) throw new Error("No player");
            switch (args[1]?.toLowerCase()) {
                case "3d":
                    if (!player.modifiers["3D"]) {
                        player.modifiers["3D"] = true;
                        msg.channel.send(client.messages.modifiers3dEnabled);
                    } else {
                        player.modifiers["3D"] = false;
                        msg.channel.send(client.messages.modifiers3dDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    break;

                case "bass":
                    const bass = parseFloat(args[2]);
                    if (isNaN(bass)) return msg.channel.send(client.messages.validNumber);
                    if (bass > 30) return msg.channel.send(client.messages.maxBass);
                    if (bass < 0) return msg.channel.send(client.messages.positiveBass);
                    player.modifiers.bass = bass;
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    msg.channel.send(
                        client.messages.bassApplied.replace("%BASS%", bass.toString())
                    );
                    break;

                case "flanger":
                    if (!player.modifiers.flanger) {
                        player.modifiers.flanger = true;
                        msg.channel.send(client.messages.modifiersFlangerEnabled);
                    } else {
                        player.modifiers.flanger = false;
                        msg.channel.send(client.messages.modifiersFlangerDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    break;

                case "nightcore":
                    if (!player.modifiers.nightCore) {
                        player.modifiers.nightCore = true;
                        msg.channel.send(client.messages.modifiersNightCoreEnabled);
                    } else {
                        player.modifiers.nightCore = false;
                        msg.channel.send(client.messages.modifiersNightCoreDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime * 1.25 + player.time) / 1000,
                        args
                    );
                    break;

                case "phaser":
                    if (!player.modifiers.phaser) {
                        player.modifiers.phaser = true;
                        msg.channel.send(client.messages.modifiersPhaserEnabled);
                    } else {
                        player.modifiers.phaser = false;
                        msg.channel.send(client.messages.modifiersPhaserDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    break;

                case "pulsator":
                    if (!player.modifiers.pulsator) {
                        player.modifiers.pulsator = true;
                        msg.channel.send(client.messages.modifiersPulsatorEnabled);
                    } else {
                        player.modifiers.pulsator = false;
                        msg.channel.send(client.messages.modifiersPulsatorDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    break;

                case "reverse":
                    if (!player.modifiers.reverse) {
                        player.modifiers.reverse = true;
                        msg.channel.send(client.messages.modifiersReverseEnabled);
                    } else {
                        player.modifiers.reverse = false;
                        msg.channel.send(client.messages.modifiersReverseDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    break;

                case "treble":
                    const treble = parseFloat(args[2]);
                    if (isNaN(treble)) return msg.channel.send(client.messages.validNumber);
                    if (treble > 20 || treble < -20)
                        return msg.channel.send(client.messages.trebleRange);
                    player.modifiers.treble = treble;
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    msg.channel.send(
                        client.messages.trebleApplied.replace("%TREBLE%", treble.toString())
                    );
                    break;

                case "tremolo":
                    if (!player.modifiers.tremolo) {
                        player.modifiers.tremolo = true;
                        msg.channel.send(client.messages.modifiersTremoloEnabled);
                    } else {
                        player.modifiers.tremolo = false;
                        msg.channel.send(client.messages.modifiersTremoloDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    break;

                case "vaporwave":
                    if (!player.modifiers.vaporwave) {
                        player.modifiers.vaporwave = true;
                        msg.channel.send(client.messages.modifiersVaporwaveEnabled);
                    } else {
                        player.modifiers.vaporwave = false;
                        msg.channel.send(client.messages.modifiersVaporwaveDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        ((player.connection.dispatcher.streamTime + player.time) * 0.8) / 1000,
                        args
                    );
                    break;

                case "vibrato":
                    if (!player.modifiers.vibrato) {
                        player.modifiers.vibrato = true;
                        msg.channel.send(client.messages.modifiersVibratoEnabled);
                    } else {
                        player.modifiers.vibrato = false;
                        msg.channel.send(client.messages.modifiersVibratoDisabled);
                    }
                    if (!player.connection) throw new Error("No connection");
                    player.replay(
                        (player.connection.dispatcher.streamTime + player.time) / 1000,
                        args
                    );
                    break;

                case "volume":
                    const volume = parseFloat(args[1]);
                    if (isNaN(volume)) return msg.channel.send(client.messages.validNumber);
                    if (volume > 100) return msg.channel.send(client.messages.maxVolume);
                    if (volume < 0) return msg.channel.send(client.messages.positiveVolume);
                    player.modifiers.volume = volume;
                    player.setVolume(volume);
                    msg.channel.send(`${client.messages.setVolume}**${volume}**`);
                    break;

                default:
                    const embed = new Discord.MessageEmbed()
                        .setTitle(client.messages.modifiersTitle)
                        .addField("3D", player.modifiers["3D"], true)
                        .addField("Bass", player.modifiers.bass, true)
                        .addField("Flanger", player.modifiers.flanger, true)
                        .addField("Nightcore", player.modifiers.nightCore, true)
                        .addField("Phaser", player.modifiers.phaser, true)
                        .addField("Pulsator", player.modifiers.pulsator, true)
                        .addField("Reverse", player.modifiers.reverse, true)
                        .addField("Treble", player.modifiers.treble, true)
                        .addField("Tremolo", player.modifiers.tremolo, true)
                        .addField("Vaporwave", player.modifiers.vaporwave, true)
                        .addField("Vibrato", player.modifiers.vibrato, true)
                        .addField("Volume", player.modifiers.volume, true)
                        .setColor(client.config.embedColor);
                    msg.channel.send(embed);
                    break;
            }
        }
    }
});

export default ModifiersCommand;
