import { Injectable } from '@angular/core';

export interface Boat {
  name: string;
  size: number;
  count: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  player1Board: string[][];
  player2Board: string[][];
  currentPlayer: number;
  boats: Boat[];
  gameOver: boolean;
  winner: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState: GameState = {
    player1Board: this.createEmptyBoard(),
    player2Board: this.createEmptyBoard(),
    currentPlayer: 1,
    boats: [],
    gameOver: false,
    winner: null
  };

  constructor() { }

  private createEmptyBoard(): string[][] {
    return Array(8).fill(null).map(() => Array(8).fill(' '));
  }

  initializeGame(boats: Boat[]): void {
    this.gameState = {
      player1Board: this.createEmptyBoard(),
      player2Board: this.createEmptyBoard(),
      currentPlayer: 1,
      boats: boats,
      gameOver: false,
      winner: null
    };
  }

  placeBoat(player: number, boat: Boat, startPos: Position, isHorizontal: boolean): boolean {
    const board = player === 1 ? this.gameState.player1Board : this.gameState.player2Board;

    if (!this.isValidPlacement(board, startPos, boat.size, isHorizontal)) {
      return false;
    }

    for (let i = 0; i < boat.size; i++) {
      const x = isHorizontal ? startPos.x + i : startPos.x;
      const y = isHorizontal ? startPos.y : startPos.y + i;
      board[y][x] = 'B';
    }

    return true;
  }

  private isValidPlacement(board: string[][], startPos: Position, size: number, isHorizontal: boolean): boolean {
    if (isHorizontal) {
      if (startPos.x + size > 8) return false;
    } else {
      if (startPos.y + size > 8) return false;
    }

    for (let i = 0; i < size; i++) {
      const x = isHorizontal ? startPos.x + i : startPos.x;
      const y = isHorizontal ? startPos.y : startPos.y + i;
      if (board[y][x] !== ' ') return false;
    }

    return true;
  }

  attack(position: Position): boolean | null {
    const targetBoard = this.gameState.currentPlayer === 1
      ? this.gameState.player2Board
      : this.gameState.player1Board;

    if (targetBoard[position.y][position.x] === 'X' || targetBoard[position.y][position.x] === 'O') {
      return null;
    }

    if (targetBoard[position.y][position.x] === 'B') {
      targetBoard[position.y][position.x] = 'X';
      this.checkGameOver();
      return true;
    } else if (targetBoard[position.y][position.x] === ' ') {
      targetBoard[position.y][position.x] = 'O';
      this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
    }

    return false;
  }

  private checkGameOver(): void {
    const boardToCheck = this.gameState.currentPlayer === 1
      ? this.gameState.player2Board
      : this.gameState.player1Board;

    const hasBoats = boardToCheck.some(row => row.some(cell => cell === 'B'));

    if (!hasBoats) {
      this.gameState.gameOver = true;
      this.gameState.winner = this.gameState.currentPlayer;
    }
  }

  getGameState(): GameState {
    return this.gameState;
  }

  isGameOver(): boolean {
    return this.gameState.gameOver;
  }

  getWinner(): number | null {
    return this.gameState.winner;
  }
}
