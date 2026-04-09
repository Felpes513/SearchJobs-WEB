import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  carregando = false;
  mensagemErro = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';

    const payload: LoginRequest = {
      email: this.loginForm.get('email')?.value ?? '',
      senha: this.loginForm.get('senha')?.value ?? '',
    };

    this.authService.login(payload).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/landing']);
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.message ||
          'Não foi possível realizar o login. Verifique suas credenciais.';
      },
    });
  }

  campoInvalido(nomeCampo: 'email' | 'senha'): boolean {
    const campo = this.loginForm.get(nomeCampo);
    return !!campo && campo.invalid && campo.touched;
  }
}
