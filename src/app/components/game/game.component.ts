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
  boatsTemplate: Boat[] = [
    { name: 'Porte-avions', size: 5, count: 1 },
    { name: 'Croiseur', size: 4, count: 1 },
    { name: 'Contre-torpilleur', size: 3, count: 2 },
    { name: 'Torpilleur', size: 2, count: 1 },
  ];

  player1Boats: Boat[] = [];
  player2Boats: Boat[] = [];

  currentBoat: Boat | null = null;
  isHorizontal: boolean = true;
  isPlacementPhase: boolean = true;
  currentPlayer: number = 1;
  waitingForPlayerChange: boolean = false;
  selectedBoard: 'own' | 'opponent' = 'own';
  message: string = '';
  showMessage: boolean = false;
  messageClass: string = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // initialiser les bateaux
    this.resetPlayerBoats();
    this.gameService.initializeGame(this.boatsTemplate);
  }

  resetPlayerBoats(): void {
    // créer des copies pour chaque joueur
    this.player1Boats = this.boatsTemplate.map(boat => ({...boat}));
    this.player2Boats = this.boatsTemplate.map(boat => ({...boat}));
    this.currentBoat = this.player1Boats[0];
  }

  startPlacement(boat: Boat): void {
    this.currentBoat = boat;
  }

  placeBoat(x: number, y: number): void {
    if (!this.currentBoat || this.selectedBoard !== 'own') return;

    const position: Position = { x, y };
    const success = this.gameService.placeBoat(
      this.currentPlayer,
      this.currentBoat,
      position,
      this.isHorizontal
    );

    if (success) {
      this.currentBoat.count--;

      // utiliser les bateaux du joueur
      const currentPlayerBoats = this.currentPlayer === 1 ? this.player1Boats : this.player2Boats;

      if (this.currentBoat.count === 0) {
        const nextBoat = currentPlayerBoats.find((b) => b.count > 0);
        this.currentBoat = nextBoat || null;
      }

      if (!this.currentBoat && this.currentPlayer === 1) {
        this.waitingForPlayerChange = true;
      } else if (!this.currentBoat && this.currentPlayer === 2) {
        this.isPlacementPhase = false;
        this.waitingForPlayerChange = true;
      }
    }
  }

  changePlayer(): void {
    if (this.isPlacementPhase) {
      if (this.currentPlayer === 1) {
        this.currentPlayer = 2;
        this.currentBoat = this.player2Boats.find((b) => b.count > 0) || null;
      } else {
        this.isPlacementPhase = false;
        this.currentPlayer = 1;
        this.selectedBoard = 'opponent';
      }
    } else {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      this.selectedBoard = 'opponent';
    }
    this.waitingForPlayerChange = false;
    this.hideMessage();
  }

  attack(x: number, y: number): void {
    if (this.isPlacementPhase || this.waitingForPlayerChange || this.selectedBoard !== 'opponent') return;

    const position: Position = { x, y };
    const result = this.gameService.attack(position);

    if (result === null) {
      this.showTemporaryMessage('Cette case a déjà été attaquée !', '');
      return;
    }

    if (this.isGameOver()) {
      return;
    }

    if (result === true) {
      this.showTemporaryMessage('Touché ! Vous pouvez rejouer.', 'message-success');
      return;
    }

    this.showTemporaryMessage('Manqué !', 'message-error');
    this.waitingForPlayerChange = true;
  }

  showTemporaryMessage(msg: string, cssClass: string = ''): void {
    this.message = msg;
    this.messageClass = cssClass;
    this.showMessage = true;
    setTimeout(() => {
      this.hideMessage();
    }, 2000);
  }

  hideMessage(): void {
    this.showMessage = false;
    this.message = '';
    this.messageClass = '';
  }

  toggleOrientation(): void {
    this.isHorizontal = !this.isHorizontal;
  }

  toggleSelectedBoard(): void {
    if (!this.isPlacementPhase) {
      this.selectedBoard = this.selectedBoard === 'own' ? 'opponent' : 'own';
    }
  }

  getCellClass(x: number, y: number, boardType: 'own' | 'opponent'): string {
    let board;

    if (boardType === 'own') {
      board = this.currentPlayer === 1
        ? this.gameService.getGameState().player1Board
        : this.gameService.getGameState().player2Board;
    } else {
      board = this.currentPlayer === 1
        ? this.gameService.getGameState().player2Board
        : this.gameService.getGameState().player1Board;
    }

    switch (board[y][x]) {
      case 'B':
        if (boardType === 'opponent' && !this.isGameOver()) {
          return 'empty';
        }
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

  getCurrentPlayerBoats(): Boat[] {
    return this.currentPlayer === 1 ? this.player1Boats : this.player2Boats;
  }
}
