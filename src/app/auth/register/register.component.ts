import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';
import { MessageService } from 'primeng/api';

function equalValue(control:AbstractControl)
{
  const password=control.get('password')?.value;
  const confirmPassword=control.get('rePassword')?.value;
  if(password===confirmPassword)
  { 
    return null;
  }
  return{NorEqualValues:true}
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers:[MessageService]
})
export class RegisterComponent{
  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authService: AuthService  ) { }

  ngOnInit() {
      this.form = this.formBuilder.group({
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          username: ['', Validators.required],
          email: ['', [Validators.required]]
      });
  }
  get f() { return this.form.controls; }
  onSubmit() {
      this.submitted = true;
      if (this.form.invalid) {
          return;
      }
      this.loading = true;
      this.authService.signUp(this.f['username'].value, this.f['firstName'].value, this.f['lastName'].value, this.f['email'].value)
          .pipe(first())
          .subscribe({
              next: (response) => {
                  console.log(response);
                  Swal.fire({
                    title: 'Registration Successful!',
                    text: 'Please check your email for the activation link.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    this.router.navigate(['/login'], { relativeTo: this.route });
                });
              },
              error: error => {
                  this.loading = false;
              },
            
          });  
  }
}
