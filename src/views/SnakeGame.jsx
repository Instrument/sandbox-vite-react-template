//An example of a game built with Claude, below code is pasted directly from Claude Artifacts

import React, { useState, useEffect, useCallback } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_FOOD = { x: 15, y: 15 };
const TARGET_SCORE = 200;
const CAREFUL_THRESHOLD = 100;

const mod = (n, m) => ((n % m) + m) % m;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [movesSinceLastFood, setMovesSinceLastFood] = useState(0);
  const [specialFood, setSpecialFood] = useState(null);

  useEffect(() => {
    let s = Date.now();
    Math.random = () => {
      s = (1103515245 * s + 12345) % 2147483647;
      return s / 2147483647;
    };
  }, []);

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (isCollision(newFood));
    setFood(newFood);
  }, []);

  const generateSpecialFood = useCallback(() => {
    if (Math.random() < 0.05) {
      let newSpecialFood;
      do {
        newSpecialFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
          type: Math.random() < 0.7 ? "score" : "speed",
        };
      } while (isCollision(newSpecialFood));
      setSpecialFood(newSpecialFood);
    } else {
      setSpecialFood(null);
    }
  }, []);

  const isCollision = useCallback(
    (point, snk = snake) => {
      return snk.some(
        (segment) => segment.x === point.x && segment.y === point.y
      );
    },
    [snake]
  );

  const getNextHead = useCallback(
    (dir, head = snake[0]) => {
      return {
        x: mod(head.x + dir.x, GRID_SIZE),
        y: mod(head.y + dir.y, GRID_SIZE),
      };
    },
    [snake]
  );

  const getAvailableDirections = useCallback(
    (head = snake[0]) => {
      const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      return directions.filter((dir) => {
        const nextHead = getNextHead(dir, head);
        return !isCollision(nextHead, snake.slice(0, -1));
      });
    },
    [getNextHead, isCollision, snake]
  );

  const findPath = useCallback(
    (start, goal, snk) => {
      const queue = [[start]];
      const visited = new Set();

      while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        if (current.x === goal.x && current.y === goal.y) {
          return path;
        }

        const directions = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ];

        for (const dir of directions) {
          const next = getNextHead(dir, current);
          const key = `${next.x},${next.y}`;

          if (!visited.has(key) && !isCollision(next, snk)) {
            visited.add(key);
            queue.push([...path, next]);
          }
        }
      }

      return null;
    },
    [getNextHead, isCollision]
  );

  const floodFill = useCallback((start, obstacles) => {
    const queue = [start];
    const visited = new Set();
    const isValidCell = (x, y) =>
      x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      for (const dir of directions) {
        const newX = x + dir.x;
        const newY = y + dir.y;
        if (
          isValidCell(newX, newY) &&
          !obstacles.some((obs) => obs.x === newX && obs.y === newY)
        ) {
          queue.push({ x: newX, y: newY });
        }
      }
    }

    return visited.size;
  }, []);

  const evaluateMove = useCallback(
    (dir, head, snk, foodPos, currentScore) => {
      const nextHead = getNextHead(dir, head);

      if (isCollision(nextHead, snk.slice(0, -1))) return -Infinity;

      let score = 0;

      // Path to food
      const pathToFood = findPath(nextHead, foodPos, snk);
      if (pathToFood) {
        score += 1000 - pathToFood.length * 10;
      } else {
        score -= 500;
      }

      // Available space after move
      const floodFillScore = floodFill(nextHead, [
        ...snk.slice(0, -1),
        nextHead,
      ]);
      score += floodFillScore * 5;

      // Consider special food
      if (specialFood) {
        const pathToSpecialFood = findPath(nextHead, specialFood, snk);
        if (pathToSpecialFood) {
          const specialFoodScore = specialFood.type === "score" ? 300 : 200;
          score += specialFoodScore - pathToSpecialFood.length * 5;
        }
      }

      // Adjust score based on current score
      if (currentScore >= CAREFUL_THRESHOLD) {
        const carefulness = Math.min(
          (currentScore - CAREFUL_THRESHOLD) /
            (TARGET_SCORE - CAREFUL_THRESHOLD),
          1
        );

        // Reduce the importance of food as score increases
        score *= 1 - carefulness * 0.4;

        // Increase the importance of available space
        score += floodFillScore * carefulness * 25;

        // Penalize moves that bring the snake's head close to its body, but only from the front
        const frontCollision = snk
          .slice(1)
          .some(
            (segment) =>
              segment.x === nextHead.x + dir.x &&
              segment.y === nextHead.y + dir.y
          );
        if (frontCollision) {
          score -= 1000 * carefulness;
        }

        // Encourage moves that keep the tail accessible
        const pathToTail = findPath(
          nextHead,
          snk[snk.length - 1],
          snk.slice(0, -1)
        );
        if (pathToTail) {
          score += 300 * carefulness;
        } else {
          score -= 600 * carefulness;
        }

        // Discourage moves that create small enclosed spaces
        const oppositeDir = { x: -dir.x, y: -dir.y };
        const behindHead = getNextHead(oppositeDir, head);
        if (!isCollision(behindHead, snk)) {
          const spaceBeforeMove = floodFill(behindHead, snk);
          const spaceAfterMove = floodFill(behindHead, [...snk, nextHead]);
          if (spaceAfterMove < spaceBeforeMove) {
            score -= (spaceBeforeMove - spaceAfterMove) * 15 * carefulness;
          }
        }
      }

      return score;
    },
    [getNextHead, isCollision, findPath, floodFill, specialFood]
  );

  const chooseDirection = useCallback(() => {
    const availableDirections = getAvailableDirections();
    if (availableDirections.length === 0) return null;

    // Occasionally make a random move to break potential loops
    if (movesSinceLastFood > GRID_SIZE * 2 && Math.random() < 0.15) {
      return availableDirections[
        Math.floor(Math.random() * availableDirections.length)
      ];
    }

    const head = snake[0];
    const scores = availableDirections.map((dir) => ({
      direction: dir,
      score: evaluateMove(dir, head, snake, food, score),
    }));

    // Choose the move with the highest score
    return scores.reduce((best, current) =>
      current.score > best.score ? current : best
    ).direction;
  }, [
    getAvailableDirections,
    movesSinceLastFood,
    snake,
    food,
    evaluateMove,
    score,
  ]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newDirection = chooseDirection();
    if (!newDirection) {
      setGameOver(true);
      return;
    }

    setDirection(newDirection);
    setSnake((prevSnake) => {
      const newHead = getNextHead(newDirection);
      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 1);
        generateFood();
        setMovesSinceLastFood(0);
      } else if (
        specialFood &&
        newHead.x === specialFood.x &&
        newHead.y === specialFood.y
      ) {
        if (specialFood.type === "score") {
          setScore((s) => s + 3);
        }
        setSpecialFood(null);
        setMovesSinceLastFood(0);
      } else {
        newSnake.pop();
        setMovesSinceLastFood((m) => m + 1);
      }

      return newSnake;
    });

    if (!specialFood) generateSpecialFood();

    // Check if the game is won
    if (score >= TARGET_SCORE) {
      setGameOver(true);
    }
  }, [
    gameOver,
    chooseDirection,
    getNextHead,
    food,
    generateFood,
    specialFood,
    generateSpecialFood,
    score,
  ]);

  useEffect(() => {
    const gameLoopInterval =
      specialFood && specialFood.type === "speed" ? 50 : 100;
    const gameLoop = setInterval(moveSnake, gameLoopInterval);
    return () => clearInterval(gameLoop);
  }, [moveSnake, specialFood]);

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    generateFood();
    setGameOver(false);
    setScore(0);
    setMovesSinceLastFood(0);
    setSpecialFood(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">AI Snake Game v4.4</h1>
      <div
        className="relative"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        <div className="absolute inset-0 bg-white border border-gray-300">
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-green-500"
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            />
          ))}
          <div
            className="absolute bg-red-500"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
          {specialFood && (
            <div
              className={`absolute ${
                specialFood.type === "speed" ? "bg-blue-500" : "bg-yellow-500"
              }`}
              style={{
                left: specialFood.x * CELL_SIZE,
                top: specialFood.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            />
          )}
        </div>
      </div>
      <div className="mt-4 text-xl">
        Score: {score} / {TARGET_SCORE}
      </div>
      {gameOver && (
        <div className="mt-4">
          <p className="text-2xl font-bold mb-2">
            {score >= TARGET_SCORE
              ? "Congratulations! You've won!"
              : "Game Over!"}
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={restartGame}
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
