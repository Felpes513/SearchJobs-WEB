import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-landing',
  imports: [RouterOutlet, Sidebar, MatIconModule, MatButtonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.menuOpen = false;
    this.router.navigateByUrl('/login');
  }
}
