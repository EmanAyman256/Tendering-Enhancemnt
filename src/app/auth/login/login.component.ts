import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import {  first } from 'rxjs';
import { AuthService } from '../auth.service';
import { AlertService } from 'src/app/shared/alert.service';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form!: FormGroup;
  loading = false;
  submitted = false;
  error!: string;

  constructor(
    private formBuilder: FormBuilder,

    private router: Router,
    private authService: AuthService,
     private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.min(6)]]
    });
  }

  // for easy access to form fields
  get f() { return this.form.controls; }
roles:string[]=[]
  onSubmit() {
    this.submitted = true;
     this.alertService.clear();

    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.authService.Login(this.f['username'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          console.log(data);
        //   const token=data.id_token
        //   let decoded: any;
        //   decoded = jwtDecode(token);
        //  // const decoded: JwtPayload = jwtDecode(token);
        //   this.roles = decoded.groups || [];
        //   console.log(this.roles);
               
          this.router.navigate(['/tendering']);
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });

  }

}