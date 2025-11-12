import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user?.rol === 'ADMIN' || user?.rol === 'MANAGER') {
        this.router.navigate(['/admin/ordenes']);
      } else {
        this.router.navigate(['/productos']);
      }
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Redirigir según el rol
          if (response.usuario.rol === 'ADMIN' || response.usuario.rol === 'MANAGER') {
            this.router.navigate(['/admin/ordenes']);
          } else {
            this.router.navigate(['/productos']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      });
    }
  }
}

