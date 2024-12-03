import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { map, Observable, take } from "rxjs";
import { AuthService } from "./auth.service";
import { jwtDecode } from "jwt-decode";
@Injectable({providedIn:'root'})
export class AuthGuard implements CanActivate{
    constructor(private authService:AuthService,private router:Router){}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> {
        return this.authService.loggedInUser.pipe(
            take(1),
            map(user => {
                if (!user) {
                    // If the user is not authenticated, redirect to login
                    return this.router.createUrlTree(['/login']);
                }

                const token = user.token;
                if (token) {
                    let decoded: any;
                    decoded = jwtDecode(token);
                   // const decoded: JwtPayload = jwtDecode(token);
                    const userRoles = decoded.groups || [];
                    const requiredRoles = route.data['role'] as string[];

                    // Check if the user has at least one of the required roles
                    const hasRequiredRole = requiredRoles
                        ? userRoles.some((role: string) => requiredRoles.includes(role))
                        : true; // If no roles are required, allow access

                    if (hasRequiredRole) {
                        return true; // Allow access
                    } else {
                        alert('You do not have permission to access this page.');
                        return this.router.createUrlTree(['/login']); // Redirect if no permission
                    }
                }

                return this.router.createUrlTree(['/login']); // Redirect if no token
            })
        );
        
    }

}