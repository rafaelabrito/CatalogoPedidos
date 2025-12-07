import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CorrelationIdService } from '../services/correlation-id.service';

export const CorrelationIdInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const correlation = inject(CorrelationIdService);
  const headerName = correlation.headerName;

  const outgoingCorrelationId = correlation.prepareRequest(request.headers.get(headerName));
  const clonedRequest = request.headers.has(headerName)
    ? request
    : request.clone({ setHeaders: { [headerName]: outgoingCorrelationId } });

  return next(clonedRequest).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const responseCorrelation = event.headers.get(headerName) ?? outgoingCorrelationId;
        correlation.updateFromResponse(responseCorrelation);
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const responseCorrelation = error.headers?.get(headerName) ?? outgoingCorrelationId;
        correlation.updateFromResponse(responseCorrelation);
      } else {
        correlation.updateFromResponse(outgoingCorrelationId);
      }

      return throwError(() => error);
    })
  );
};