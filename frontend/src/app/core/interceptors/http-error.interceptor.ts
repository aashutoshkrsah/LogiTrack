import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '../../models/dashboard.model';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let friendlyMessage = 'Unable to reach the server. Please ensure the Spring Boot API is running on http://localhost:8080.';
      let fieldErrors: Record<string, string> | undefined;

      if (error.status !== 0) {
        const apiErr = error.error as ApiErrorResponse | undefined;
        if (apiErr && typeof apiErr === 'object' && apiErr.message) {
          friendlyMessage = apiErr.message;
          fieldErrors = apiErr.fieldErrors;
        } else if (typeof error.error === 'string' && error.error.trim().length > 0) {
          friendlyMessage = error.error;
        } else if (error.status === 500 || error.status === 502 || error.status === 504) {
          friendlyMessage =
            'Backend API server (http://localhost:8080) is unreachable or failed to respond. Start Spring Boot with MySQL configured (DB_PASSWORD) and refresh.';
        } else {
          friendlyMessage = `Request failed (${error.status} ${error.statusText || 'Error'})`;
        }
      }

      return throwError(() => ({
        status: error.status,
        message: friendlyMessage,
        fieldErrors
      }));
    })
  );
};
