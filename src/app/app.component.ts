import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import GameComponent from './components/game/game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bataille-navale';
}
