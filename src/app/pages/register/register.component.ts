import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CiudadService } from '../../services/ciudad.service';
import { Ciudad } from '../../models/ciudad.interface';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private ciudadService = inject(CiudadService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  ciudades: Ciudad[] = [];
  loadingCiudades = true;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre: ['', [Validators.required]],
      ciudad: ['', [Validators.required]]
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

    // Cargar ciudades
    this.cargarCiudades();
  }

  cargarCiudades() {
    this.loadingCiudades = true;
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades) => {
        this.ciudades = ciudades;
        this.loadingCiudades = false;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
        this.loadingCiudades = false;
      }
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData = {
        ...this.registerForm.value,
        rol: 'USER' // Por defecto, los registros son usuarios normales
      };

      this.authService.register(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/productos']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Error al registrarse. Intenta nuevamente.';
        }
      });
    }
  }
}
