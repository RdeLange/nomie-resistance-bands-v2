# Nomie Resistance Bands v2

Resistance band workouts with an animation for each exercise, a timer for the session and each exercise, and a log to Nomie.

The session is built like the 7 minute workout: programs of ten exercises of 30 seconds with 10 second rests, chosen by the part of the body.

## Drawings and licence

The drawings are the 19 resistance band exercises of [workout-guide](https://github.com/bryllim/workout-guide) by Bryl Lim, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). They are derived from the exercise artwork of [Everkinetic](https://github.com/everkinetic/data), also CC BY-SA 4.0. The components in `src/animations/` hold the drawings as adapted SVG, under the same licence. See ATTRIBUTION.md.

## Develop

    npm install
    npm run dev        # the app
    npx vitest run     # the tests
    npm run build      # a build for GitHub Pages
