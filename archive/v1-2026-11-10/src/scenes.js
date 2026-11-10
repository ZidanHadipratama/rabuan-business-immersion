// Entry for esbuild: exposes scene factories on window.Scenes.
import { renderer } from "./common.js";
import { answerScene, driveScene, truckSprite } from "./scene-truck.js";
import { terminalScene } from "./scene-terminal.js";
import { logoScene } from "./scene-logo.js";

window.Scenes = { answer: answerScene, drive: driveScene, terminal: terminalScene, logo: logoScene };
window.truckSprite = () => truckSprite(renderer);
