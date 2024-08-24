import { canvas, cx } from "./graphics";
import { initializeKeyboard, waitForEnter } from "./keyboard";
import { Level, State } from "./Level";
import { simpleTrack } from "./tracks";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

let lastTime = 0;

let level = new Level(simpleTrack);

let spawns = 0;
let successes = 0;

const maxRadius = Math.max(screen.width, screen.height) / 1.5;

enum GameState {
    Init,
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
        case GameState.Ready:
            level = new Level(simpleTrack);
            radius = maxRadius;
            // playTune(SFX_START);
            break;
        case GameState.Running:
            // playTune(SFX_MAIN);
            break;
        case GameState.GameOver:
            radius = 1;
            // playTune(SFX_FINISHED);
            break;
        case GameState.GameFinished:
            successes++;
            spawns = spawns + 5; // Make it harder this time
            radius = 1;
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
                setState(GameState.GameFinished);
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
    cx.globalAlpha = alpha > 0 ? alpha : 0;
    cx.fillStyle = "white";
    cx.font = fontSize + "px " + fontName;
    const textWidth = cx.measureText(text).width;
    cx.fillText(
        text,
        (canvas.width - textWidth) / 2,
        canvas.height / 2 + yAdjust,
    );
    cx.globalAlpha = 1;
};

const draw = (t: number, dt: number): void => {
    cx.save();
    cx.fillStyle = "rgb(20, 50, 50)";
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
                    "GO! But do not be the 13th!",
                    64,
                    "Brush Script MT",
                    radius / maxRadius,
                );
                radius -= 10;
            }

            break;
        }
        case GameState.GameOver: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            cx.beginPath();
            cx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            cx.fillStyle = "#802010";
            cx.fill();
            centerText(
                "Try again!!",
                64,
                "Brush Script MT",
                radius / maxRadius,
            );
            centerText("Press enter", 24, "Sans-serif", 1, 80);

            if (radius >= maxRadius) {
                waitForEnter().then(() => setState(GameState.Ready));
            } else {
                radius += 10;
            }
            break;
        }
        case GameState.GameFinished: {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            cx.beginPath();
            cx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            cx.fillStyle = "#CCCC40";
            cx.fill();

            centerText("Race finised", 48, "Brush Script MT", 1, -20);
            centerText(
                "READY FOR NEXT RACE " +
                    successes +
                    (successes > 1 ? " TIMES!" : " TIME!"),
                48,
                "Brush Script MT",
                1,
                30,
            );
            centerText("Press enter", 32, "Sans-serif", 24, 100);

            if (radius >= maxRadius) {
                waitForEnter().then(() => setState(GameState.Ready));
            } else {
                radius += 10;
            }
            break;
        }
        default:
            break;
    }
    cx.restore();
};

export const onCanvasSizeChanged = (): void => {
    level.resetZoom();
};

const drawInitialScreen = (text: string): void => {
    cx.save();
    cx.fillStyle = "rgb(20, 20, 50)";
    cx.rect(0, 0, canvas.width, canvas.height);
    cx.fill();

    centerText('"13th guys"', 64, "Brush Script MT", 1, -20);
    centerText("WIP", 24, "Brush Script MT", 1, 20);
    centerText(text, 24, "Sans-serif", 1, 80);
    cx.restore();
};

export const start = async (): Promise<void> => {
    initializeKeyboard();
    drawInitialScreen("Loading...");
    // await initialize();

    drawInitialScreen("Press enter key to start the race!");
    await waitForEnter();

    setState(GameState.Ready);
    window.requestAnimationFrame(gameLoop);
};
