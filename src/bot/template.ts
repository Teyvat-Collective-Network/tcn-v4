import { Colors } from "discord.js";

function embed(title: string, body: string, color: number, ephemeral: boolean) {
    return { embeds: [{ title, description: body, color }], ephemeral, content: "", files: [], components: [] };
}

export default {
    error: (body: string, title: string = "Error", ephemeral: boolean = true) => embed(title, body, Colors.Red, ephemeral),
    info: (body: string, title: string = "Info", ephemeral: boolean = true) => embed(title, body, Colors.Blue, ephemeral),
    ok: (body: string, title: string = "OK", ephemeral: boolean = true) => embed(title, body, Colors.Green, ephemeral),
    warning: (body: string, title: string = "Warning", ephemeral: boolean = true) => embed(title, body, Colors.Yellow, ephemeral),
};
