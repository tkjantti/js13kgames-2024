import { canvas, cx } from "./graphics";
import {
    initializeKeyboard,
    sleep,
    waitForAnyKey,
    waitForEnter,
} from "./keyboard";
import { Level, State } from "./Level";
import { simpleTrack } from "./tracks";

import {
    initialize,
    playTune,
    SFX_START,
    SFX_RACE,
    SFX_FINISHED,
    // Ignore lint errors from JS import
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
} from "./sfx/sfx.js";
import {
    CharacterAnimation,
    CharacterFacingDirection,
    renderCharacter,
} from "./CharacterAnimation.js";
import { playerColor } from "./Character.js";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

let lastTime = 0;

let level = new Level(simpleTrack);

const maxRadius = Math.max(screen.width, screen.height) / 1.5;

enum GameState {
    Init,
    Start,
    Ready,
    Running,
    GameOver,
    GameFinished,
}

let gameState: GameState = GameState.Init;

// For drawing start- and game over screens.
let radius = 0;

const setState = (state: GameState): void => {
    gameState = state;

    switch (state) {
        case GameState.Start:
            playTune(SFX_START);
            break;
        case GameState.Ready:
            level = new Level(simpleTrack);
            radius = maxRadius;
            playTune(SFX_RACE);
            break;
        case GameState.Running:
            break;
        case GameState.GameOver:
            radius = 1;
            playTune(SFX_FINISHED);
            break;
        case GameState.GameFinished:
            radius = 1;
            playTune(SFX_FINISHED);
            break;
        default:
            break;
    }
};

const gameLoop = (t: number): void => {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(t - lastTime, MAX_FRAME);
    lastTime = t;

    update(t, dt);
    draw(t, dt);
};

const update = (t: number, dt: number): void => {
    switch (gameState) {
        case GameState.Running: {
            level.update(t, dt);
            if (level.state === State.GAME_OVER) {
                setState(GameState.GameOver);
            } else if (level.state === State.FINISHED) {
                sleep(500).then(() => setState(GameState.GameFinished));
            }
            break;
        }
        default:
            break;
    }
};

const centerText = (
    text: string,
    fontSize: number,
    fontName: string,
    alpha = 1,
    yAdjust = 0,
) => {
    cx.save();
    cx.globalAlpha = alpha > 0 ? alpha : 0;
    cx.fillStyle = "white";
    cx.font = fontSize + "px " + fontName;
    const textWidth = cx.measureText(text).width;
    cx.fillText(
        text,
        (canvas.width - textWidth) / 2,
        canvas.height / 2 + yAdjust,
    );
    cx.restore();
};

const draw = (t: number, dt: number): void => {
    cx.save();
    cx.fillStyle = "rgb(0, 0, 10)";
    cx.fillRect(0, 0, canvas.width, canvas.height);
    level.draw(t, dt);
    cx.restore();

    cx.save();
    switch (gameState) {
        case GameState.Ready: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            if (radius <= 0) {
                setState(GameState.Running);
            } else {
                cx.beginPath();
                cx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                cx.fillStyle = "#105000";
                cx.fill();
                centerText(
                    "GO! Avoid to be the 13th!",
                    64,
                    "Impact",
                    radius / maxRadius,
                );

                radius -= 10;
            }
            applyGradient();

            break;
        }
        case GameState.GameOver: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            cx.beginPath();
            cx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            cx.fillStyle = "#802010";
            cx.fill();
            centerText("TERMINATED!", 64, "Impact", radius / maxRadius);
            centerText("Press enter", 24, "Sans-serif", 1, 80);

            if (radius >= maxRadius) {
                waitForEnter().then(() => setState(GameState.Ready)); // TODO: Go to start screen intead
            } else {
                radius += 10;
            }
            applyGradient();

            break;
        }
        case GameState.GameFinished: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            if (radius >= 50) {
                cx.beginPath();
                cx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                cx.fillStyle = "#CCCC40";
                cx.fill();
                centerText(
                    "Race finished. You where number " +
                        level.characters[0].rank,
                    48,
                    "Impact",
                    1,
                    -20,
                );
                centerText("READY FOR NEXT RACE", 48, "Sans-serif", 1, 30);
            }

            if (radius >= maxRadius) {
                centerText("Press enter", 32, "Sans-serif", 24, 100);
                waitForEnter().then(() => setState(GameState.Ready));
            } else {
                radius += 10;
            }
            applyGradient();

            break;
        }
        default: {
            applyGradient(true);

            break;
        }
    }

    cx.restore();
};

export const onCanvasSizeChanged = (): void => {
    level.resetZoom();
};

const applyCRTEffect = (): void => {
    const imageData = cx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;

            // Apply scanlines
            if (y % 2 === 0) {
                data[index] *= 0.5; // Red
                data[index + 1] *= 0.5; // Green
                data[index + 2] *= 0.5; // Blue
            }

            // Apply noise
            const noise = (Math.random() - 0.5) * 20;
            data[index] += noise; // Red
            data[index + 1] += noise; // Green
            data[index + 2] += noise; // Blue
        }
    }

    cx.putImageData(imageData, 0, 0);
};

const applyGradient = (track = false) => {
    const width = canvas.width;
    const height = canvas.height;
    const gradient = cx.createRadialGradient(
        width / 2,
        height / 2,
        0, // Inner circle
        width / 2,
        height / 2,
        width / 2, // Outer circle
    );
    if (track) {
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    } else {
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    }

    cx.fillStyle = gradient;
    cx.fillRect(0, 0, width, height);
};

const drawInitialScreen = (text: string): void => {
    cx.save();
    cx.fillStyle = "rgb(20, 20, 50)";
    cx.rect(0, 0, canvas.width, canvas.height);
    cx.fill();

    cx.save();
    cx.translate(canvas.width / 4, canvas.height / 2.5);
    renderCharacter(
        cx,
        playerColor,
        canvas.height / 6,
        canvas.height / 2,
        0,
        CharacterFacingDirection.Backward,
        CharacterAnimation.Still,
    );
    cx.restore();

    centerText("don't be the", 24, "Impact", 1, -30);
    centerText("13TH GUY", 64, "Impact", 1, 30);
    centerText(text, 24, "Sans-serif", 1, 80);
    cx.restore();

    applyCRTEffect();
    applyGradient();
};

export const start = async (): Promise<void> => {
    initializeKeyboard();
    centerText("Loading...", 24, "Sans-serif", 1, 80);
    await initialize();

    cx.save();
    cx.fillStyle = "rgb(20, 20, 50)";
    cx.rect(0, 0, canvas.width, canvas.height);
    cx.fill();
    centerText("don't be the", 24, "Impact", 1, -30);
    centerText("13TH GUY", 64, "Impact", 1, 30);
    centerText("Press any key", 24, "Sans-serif", 1, 80);
    cx.restore();
    applyGradient();
    applyCRTEffect();
    await waitForAnyKey();

    setState(GameState.Start);
    drawInitialScreen("Press enter key to start the race!");
    await waitForEnter();

    // Pause a little to allow music fade in fully before fading it out if user is too fast to press enter
    setTimeout(() => {
        setState(GameState.Ready);
        window.requestAnimationFrame(gameLoop);
    }, 500);
};
