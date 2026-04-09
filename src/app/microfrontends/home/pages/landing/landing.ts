import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Sidebar } from '../../../../layout/sidebar/sidebar';

@Component({
  selector: 'app-landing',
  imports: [RouterOutlet, Sidebar, MatIconModule, MatButtonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
