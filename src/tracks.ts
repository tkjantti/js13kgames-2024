/*
 * Copyright (c) 2024 Tero Jäntti, Sami Heikkinen
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TT } from "./TrackElement";

export const simpleTrack: readonly TT[] = [
    TT.FullWidth,
    TT.FullWidth,
    TT.Checkpoint,

    TT.Basic,
    TT.SlopeEmptySlope,
    TT.SlopeEmptyPassage,
    TT.DualPassage,
    TT.Basic,
    TT.RightPassage,
    TT.RightPassage,
    TT.Basic,
    TT.TwoRafts,
    TT.Chasm,
    TT.FullWidth,
    TT.Checkpoint,

    TT.FullWidthWithObstacles,
    TT.FullWidthWithMoreObstacles,
    TT.FullWidthWithObstacles,
    TT.DualPassage,
    TT.DualPassage,
    TT.DualPassage,
    TT.FullWidth,
    TT.Finish,
];

export const secondTrack: readonly TT[] = [
    TT.FullWidth,
    TT.FullWidth,
    TT.BasicSteepSlope,
    TT.BasicSlope,
    TT.BasicSlope,
    TT.Basic,
    TT.Basic,
    TT.Basic,
    TT.Narrow,
    TT.VeryNarrow,
    TT.VeryNarrow,
    TT.Basic,
    TT.FullWidthWithObstacles,
    TT.SlopeObstacleSlope,
    TT.PassageEmptySlope,
    TT.PassageEmptySlope,
    TT.DualPassage,
    TT.DualPassage,
    TT.FullWidth,
    TT.FullWidthWithObstaclesOnRight,
    TT.FullWidthWithObstaclesOnRight2,
    TT.FullWidthWithObstaclesOnRight,
    TT.FullWidth,
    TT.Raft,
    TT.Chasm,
    TT.Checkpoint,

    TT.FullWidth,
    TT.VeryNarrow,
    TT.FullWidth,
    TT.BasicSteepSlope,
    TT.BasicSlope,
    TT.BasicSlope,
    TT.Basic,
    TT.Basic,
    TT.Basic,
    TT.Basic,
    TT.Basic,
    TT.TwoRafts,
    TT.Chasm,
    TT.Finish,
];

export const thirdTrack: readonly TT[] = [
    TT.FullWidth,
    TT.Basic,
    TT.Narrow,
    TT.VeryNarrow,
    TT.VeryNarrow,
    TT.Basic,
    TT.DualPassage,
    TT.DualPassage,
    TT.DualPassage,
    TT.FullWidthWithObstacles,
    TT.FullWidthWithMoreObstacles,
    TT.Checkpoint,
    TT.FullWidth,
    TT.FullWidth,
    TT.TwoRafts,
    TT.Chasm,
    TT.FullWidth,
    TT.TwoRafts,
    TT.Chasm,
    TT.FullWidth,
    TT.FullWidthWithMoreObstacles,
    TT.Checkpoint,
    TT.FullWidth,
    TT.Raft,
    TT.Chasm,
    TT.Checkpoint,
    TT.BasicSlope,
    TT.FullWidthWithObstacles,
    TT.FullWidth,
    TT.Basic,
    TT.FullWidthWithMoreObstacles,
    TT.FullWidthWithMoreObstacles,
    TT.Checkpoint,
    TT.FullWidth,
    TT.Raft,
    TT.Chasm,
    TT.FullWidthWithObstacles,
    TT.FullWidthWithMoreObstacles,
    TT.BasicSlope,
    TT.FullWidthWithObstacles,
    TT.Basic,
    TT.Basic,
    TT.VeryNarrow,
    TT.FullWidthWithObstacles,
    TT.DualPassage,
    TT.FullWidthWithMoreObstacles,
    TT.Checkpoint,
    TT.FullWidth,
    TT.VeryNarrow,
    TT.FullWidthWithObstacles,
    TT.FullWidth,
    TT.BasicSteepSlope,
    TT.BasicSteepSlope,
    TT.FullWidthWithObstacles,
    TT.FullWidthWithMoreObstacles,
    TT.Basic,
    TT.Checkpoint,
    TT.FullWidth,
    TT.Raft,
    TT.Chasm,
    TT.VeryNarrow,
    TT.FullWidthWithObstacles,
    TT.BasicSteepSlope,
    TT.BasicSteepSlope,
    TT.FullWidthWithMoreObstacles,
    TT.FullWidth,
    TT.Finish,
];
