import Formatter from "./formatter.js";
import Scenarist from "scenarist.dev";

const play = Scenarist(new Formatter());
const path = "./formatter.js";
const output = play(path);
console.log(output);
