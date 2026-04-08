import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../../../layout/sidebar/sidebar';

@Component({
  selector: 'app-landing',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {}