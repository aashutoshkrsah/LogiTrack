import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Attaches the Bearer token to API calls, except auth and public endpoints.
 * On 401 it clears the session and sends the user to /login (unless already
 * on /login or the public /track page). Handles both raw HttpErrorResponse
 * and the plain {status, message} object produced by httpErrorInterceptor,
 * whichever runs first in the chain.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const url = req.url;

  const isPublic = url.includes('/api/auth/') || url.includes('/api/public/') || url.includes('/login');
  const token = auth.getToken();
  const authReq = !isPublic && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      const status = err instanceof HttpErrorResponse ? err.status : (err as { status?: number } | null)?.status;
      if (status === 401) {
        const current = router.url || '';
        if (!current.startsWith('/login') && !current.startsWith('/track')) {
          auth.logout(false);
          void router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
