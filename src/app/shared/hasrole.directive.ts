import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Directive({
  selector: '[appHasRole]' // Attribute selector
})
export class HasRoleDirective {
  private currentUserRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
  //   // Get roles from the token
  //   this.currentUserRoles = this.authService.getUserRoles();
  // }

  // @Input()
  // set appHasRole(requiredRoles: string | string[]) {
  //   const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  //   const hasAccess = rolesArray.some(role => this.currentUserRoles.includes(role));

  //   if (hasAccess) {
  //     // If user has access, display the element
  //     this.viewContainer.createEmbeddedView(this.templateRef);
  //   } else {
  //     // Otherwise, clear the view
  //     this.viewContainer.clear();
  //   }
  }
}