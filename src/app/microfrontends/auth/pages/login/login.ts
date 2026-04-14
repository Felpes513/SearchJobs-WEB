import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  private resetButtonTimerId: ReturnType<typeof window.setTimeout> | null = null;

  carregando = false;
  enviandoReset = false;
  mensagemErro = '';
  mensagemSucesso = '';
  forgotPasswordAberto = false;
  mensagemErroReset = '';
  mensagemSucessoReset = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
    rememberMe: [false],
  });

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const rememberedEmail = this.authService.getRememberedEmail();
    const rememberMe = this.authService.isRememberMeEnabled();

    if (!rememberMe || !rememberedEmail) {
      return;
    }

    this.loginForm.patchValue({
      email: rememberedEmail,
      rememberMe: true,
    });

    this.forgotPasswordForm.patchValue({
      email: rememberedEmail,
    });
  }

  ngOnDestroy(): void {
    this.limparTimerReset();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const payload: LoginRequest = {
      email: this.loginForm.get('email')?.value ?? '',
      senha: this.loginForm.get('senha')?.value ?? '',
    };
    const rememberMe = !!this.loginForm.get('rememberMe')?.value;

    this.authService.login(payload, rememberMe).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/landing/home']);
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível realizar o login. Verifique suas credenciais.';
      },
    });
  }

  toggleForgotPassword(): void {
    this.forgotPasswordAberto = !this.forgotPasswordAberto;
    this.mensagemErroReset = '';
    this.mensagemSucessoReset = '';

    if (!this.forgotPasswordAberto) {
      this.cdr.detectChanges();
      return;
    }

    const loginEmail = this.loginForm.get('email')?.value ?? '';
    this.forgotPasswordForm.patchValue({
      email: loginEmail,
    });

    this.cdr.detectChanges();
  }

  enviarLinkRedefinicao(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.limparTimerReset();

    this.enviandoReset = true;
    this.mensagemErroReset = '';
    this.mensagemSucessoReset = '';
    this.cdr.detectChanges();

    this.resetButtonTimerId = window.setTimeout(() => {
      this.enviandoReset = false;
      this.resetButtonTimerId = null;
      this.cdr.detectChanges();
    }, 15000);

    const email = this.forgotPasswordForm.get('email')?.value ?? '';

    this.authService
      .forgotPassword({ email })
      .pipe(
        finalize(() => {
          this.limparTimerReset();
          this.enviandoReset = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.mensagemSucessoReset =
            response?.message ||
            'Se existir uma conta com esse e-mail, enviaremos um link de redefinição em instantes.';
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.mensagemErroReset =
            error?.error?.errors?.email ||
            error?.error?.message ||
            'Não foi possível solicitar a redefinição de senha agora.';
          this.cdr.detectChanges();
        },
      });
  }

  campoInvalido(nomeCampo: 'email' | 'senha'): boolean {
    const campo = this.loginForm.get(nomeCampo);
    return !!campo && campo.invalid && campo.touched;
  }

  campoResetInvalido(): boolean {
    const campo = this.forgotPasswordForm.get('email');
    return !!campo && campo.invalid && campo.touched;
  }

  private limparTimerReset(): void {
    if (this.resetButtonTimerId !== null) {
      window.clearTimeout(this.resetButtonTimerId);
      this.resetButtonTimerId = null;
    }
  }
}
