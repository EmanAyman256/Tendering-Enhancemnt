import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { exhaustMap, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    return this.authService.loggedInUser.pipe(
      take(1),
      exhaustMap(user => {
        if (!user || !user.token) {
          console.log('No valid user or token found.');
          return next.handle(request);
        }
  
        const modifiedReq = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${user.token}`)
        });
        
        console.log('Modified Request with Token:', modifiedReq);
        return next.handle(modifiedReq);
        
      })
    ); 
   }
}
