import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Boat, Position } from '../../services/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export default class GameComponent implements OnInit {
  boats: Boat[] = [
    { name: 'Porte-avions', size: 5, count: 1 },
    { name: 'Croiseur', size: 4, count: 1 },
    { name: 'Contre-torpilleur', size: 3, count: 2 },
    { name: 'Torpilleur', size: 2, count: 1 },
  ];

  currentBoat: Boat | null = null;
  isHorizontal: boolean = true;
  isPlacementPhase: boolean = true;
  currentPlayer: number = 1;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.initializeGame(this.boats);
  }

  startPlacement(boat: Boat): void {
    this.currentBoat = boat;
  }

  placeBoat(x: number, y: number): void {
    if (!this.currentBoat) return;

    const position: Position = { x, y };
    const success = this.gameService.placeBoat(
      this.currentPlayer,
      this.currentBoat,
      position,
      this.isHorizontal
    );

    if (success) {
      this.currentBoat.count--;
      if (this.currentBoat.count === 0) {
        const nextBoat = this.boats.find((b) => b.count > 0);
        this.currentBoat = nextBoat || null;
      }

      if (!this.currentBoat && this.currentPlayer === 1) {
        this.currentPlayer = 2;
        this.currentBoat = this.boats.find((b) => b.count > 0) || null;
      } else if (!this.currentBoat && this.currentPlayer === 2) {
        this.isPlacementPhase = false;
      }
    }
  }

  attack(x: number, y: number): void {
    if (this.isPlacementPhase) return;

    const position: Position = { x, y };
    this.gameService.attack(position);
  }

  toggleOrientation(): void {
    this.isHorizontal = !this.isHorizontal;
  }

  getCellClass(x: number, y: number): string {
    const board =
      this.currentPlayer === 1
        ? this.gameService.getGameState().player1Board
        : this.gameService.getGameState().player2Board;

    switch (board[y][x]) {
      case 'B':
        return 'boat';
      case 'X':
        return 'hit';
      case 'O':
        return 'miss';
      default:
        return 'empty';
    }
  }

  isGameOver(): boolean {
    return this.gameService.isGameOver();
  }

  getWinner(): number | null {
    return this.gameService.getWinner();
  }
}
