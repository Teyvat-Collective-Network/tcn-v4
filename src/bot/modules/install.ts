import { Client } from "discord.js";
import banshares from "./banshares.js";
import commands from "./commands.js";
import cycles from "./cycles.js";
import general from "./general.js";

export default function (bot: Client<true>) {
    banshares(bot);
    commands(bot);
    cycles(bot);
    general(bot);
}
