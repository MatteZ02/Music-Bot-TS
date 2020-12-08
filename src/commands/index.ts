import aliasesCommand from "./aliases";
import bassCommand from "./bass";
import forceSkipCommand from "./forceskip";
import helpCommand from "./help";
import loopCommand from "./loop";
import loopSongCommand from "./loopsong";
import modifiersCommand from "./modifiers";
import moveCommand from "./move";
import nowPlayingCommand from "./nowplaying";
import pauseCommand from "./pause";
import pingCommand from "./ping";
import playCommand from "./play";
import previousCommand from "./previous";
import queueCommand from "./queue";
import removeCommand from "./remove";
import replayCommand from "./replay";
import resumeCommand from "./resume";
import searchCommand from "./search";
import seekCommand from "./seek";
import shuffleCommand from "./shuffle";
import skipCommand from "./skip";
import skiptoCommand from "./skipto";
import stopCommand from "./stop";
import volumeCommand from "./volume";

import { Command } from "../base/Command";

const commands: Command[] = [
    aliasesCommand,
    helpCommand,
    bassCommand,
    forceSkipCommand,
    loopCommand,
    loopSongCommand,
    modifiersCommand,
    moveCommand,
    nowPlayingCommand,
    pauseCommand,
    pingCommand,
    playCommand,
    previousCommand,
    queueCommand,
    removeCommand,
    replayCommand,
    resumeCommand,
    searchCommand,
    seekCommand,
    shuffleCommand,
    skipCommand,
    skiptoCommand,
    stopCommand,
    volumeCommand
];

export default commands;
