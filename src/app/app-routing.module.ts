import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainitemsComponent } from './components/mainitems/mainitems.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path:'',
    component:LoginComponent
    
  },
  {
    path:'login',
    component:LoginComponent,
  },
  {
    path:'signup',
    component:RegisterComponent
  },
  {
    path:'tendering',
    component:MainitemsComponent,
    canActivate:[AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
