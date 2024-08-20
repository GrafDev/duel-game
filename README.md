# Duel Game

A 2D canvas-based dueling game built with React and TypeScript.

## Description

Duel Game is an interactive web-based game where two heroes face off in a magical duel. Players can choose to control either the left or right hero, with the AI controlling the opponent. The game features customizable hero speeds, fire rates, and spell colors.

## Features

- Canvas-based rendering for smooth gameplay
- Player vs AI gameplay
- Customizable hero attributes (speed and fire rate)
- Responsive design that adapts to different screen sizes
- Score tracking
- Mouse-based hero movement for the player
- AI-controlled opponent with randomized movement patterns

## Technologies Used

- React
- TypeScript
- HTML5 Canvas
- CSS Modules

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/duel-game.git
   ```
2. Navigate to the project directory:
   ```
   cd duel-game
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

## How to Play

1. Choose your side (left or right) at the start of the game.
2. Move your hero up and down using your mouse.
3. Your hero will automatically cast spells towards the opponent.
4. Dodge enemy spells while trying to hit your opponent.
5. Each hit increases your score by one point.
6. Use the sliders below the game field to adjust your hero's speed and fire rate.

## Project Structure

- `Game.tsx`: Main game component handling game logic and rendering
- `ScoreBoard.tsx`: Component for displaying the current score
- `Controls.tsx`: Component for hero speed and fire rate controls
- `PlayerSelection.tsx`: Component for selecting the player's side
- `types.ts`: TypeScript type definitions for the game

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
