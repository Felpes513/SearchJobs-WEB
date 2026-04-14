import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  carregando = false;
  mensagemErro = '';
  mensagemSucesso = '';

  resetForm = this.fb.group({
    token: ['', [Validators.required]],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (token) {
      this.resetForm.patchValue({ token });
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.senhasConferem()) {
      this.resetForm.markAllAsTouched();

      if (!this.senhasConferem()) {
        this.mensagemErro = 'A confirmacao da senha precisa ser igual a nova senha.';
      }

      return;
    }

    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const token = this.resetForm.get('token')?.value ?? '';
    const novaSenha = this.resetForm.get('novaSenha')?.value ?? '';

    this.authService.resetPassword({ token, novaSenha }).subscribe({
      next: () => {
        this.carregando = false;
        this.mensagemSucesso = 'Senha redefinida com sucesso. Voce ja pode entrar com a nova senha.';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.campos?.novaSenha ||
          error?.error?.mensagem ||
          error?.error?.message ||
          'Nao foi possivel redefinir sua senha agora.';
      },
    });
  }

  campoInvalido(nomeCampo: 'token' | 'novaSenha' | 'confirmarSenha'): boolean {
    const campo = this.resetForm.get(nomeCampo);
    return !!campo && campo.invalid && campo.touched;
  }

  senhasConferem(): boolean {
    const novaSenha = this.resetForm.get('novaSenha')?.value ?? '';
    const confirmarSenha = this.resetForm.get('confirmarSenha')?.value ?? '';

    return !!novaSenha && novaSenha === confirmarSenha;
  }
}
