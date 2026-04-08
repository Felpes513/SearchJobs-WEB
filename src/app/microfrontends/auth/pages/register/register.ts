import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  carregando = false;
  mensagemErro = '';
  mensagemSucesso = '';

  registerForm = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const payload: RegisterRequest = {
      nome: this.registerForm.get('nome')?.value ?? '',
      email: this.registerForm.get('email')?.value ?? '',
      senha: this.registerForm.get('senha')?.value ?? '',
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.carregando = false;
        this.mensagemSucesso = response.mensagem || 'Cadastro realizado com sucesso.';
        this.registerForm.reset();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.message ||
          'Não foi possível realizar o cadastro.';
      },
    });
  }

  campoInvalido(nomeCampo: 'nome' | 'email' | 'senha'): boolean {
    const campo = this.registerForm.get(nomeCampo);
    return !!campo && campo.invalid && campo.touched;
  }
}