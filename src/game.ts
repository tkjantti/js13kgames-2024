import { canvas, cx } from "./graphics";
import { initializeKeyboard } from "./keyboard";
import { Level } from "./Level";
import { simpleTrack } from "./tracks";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

let lastTime = 0;

const level = new Level(simpleTrack);

const gameLoop = (t: number): void => {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(t - lastTime, MAX_FRAME);
    lastTime = t;

    update(t, dt);
    draw(t, dt);
};

const update = (t: number, dt: number): void => {
    level.update(t, dt);
};

const draw = (t: number, dt: number): void => {
    cx.save();
    cx.fillStyle = "black";
    cx.fillRect(0, 0, canvas.width, canvas.height);

    level.draw(t, dt);

    cx.restore();
};

export const onCanvasSizeChanged = (): void => {
    level.resetZoom();
};

export const start = async (): Promise<void> => {
    initializeKeyboard();
    window.requestAnimationFrame(gameLoop);
};
