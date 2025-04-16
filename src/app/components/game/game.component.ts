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
    // Initialiser les bateaux pour chaque joueur indépendamment
    this.resetPlayerBoats();
    this.gameService.initializeGame(this.boatsTemplate);
  }

  resetPlayerBoats(): void {
    // Créer des copies profondes des bateaux pour chaque joueur
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

      // Utiliser les bateaux du joueur actuel
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

    // Si result est null, la case a déjà été attaquée
    if (result === null) {
      this.showTemporaryMessage('Cette case a déjà été attaquée !', '');
      return;
    }

    // Si le jeu est terminé, pas besoin d'attendre le changement de joueur
    if (this.isGameOver()) {
      return;
    }

    // Si result est true, un bateau a été touché et le joueur peut rejouer
    if (result === true) {
      this.showTemporaryMessage('Touché ! Vous pouvez rejouer.', 'message-success');
      return;
    }

    // Si c'est un coup dans l'eau, on attend la confirmation pour passer au joueur suivant
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
      // Plateau du joueur actuel
      board = this.currentPlayer === 1
        ? this.gameService.getGameState().player1Board
        : this.gameService.getGameState().player2Board;
    } else {
      // Plateau de l'adversaire
      board = this.currentPlayer === 1
        ? this.gameService.getGameState().player2Board
        : this.gameService.getGameState().player1Board;
    }

    switch (board[y][x]) {
      case 'B':
        // Ne pas montrer les bateaux de l'adversaire sauf s'ils sont touchés
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

  // Retourne les bateaux du joueur actuel
  getCurrentPlayerBoats(): Boat[] {
    return this.currentPlayer === 1 ? this.player1Boats : this.player2Boats;
  }
}
