import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(of(true));
    
    guard.canActivate().subscribe(result => {
      expect(result).toBeTrue();
      expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });
  });

  it('should redirect to login when user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(of(false));
    routerSpy.createUrlTree.and.returnValue('/login' as any);
    
    guard.canActivate().subscribe(result => {
      expect(result).not.toBeTrue();
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
  });
});
