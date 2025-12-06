// src/app/core/interceptors/error-handling.interceptor.ts
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/api-response.interface';

export const ErrorHandlingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(request).pipe(
    // 1. Processa Respostas de SUCESSO com cod_retorno = 1
    map((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        const body = event.body as ApiResponse<any>;

        // Se a API retornar 200/201, mas o envelope indicar erro (cod_retorno: 1) 
        if (body && body.cod_retorno === 1) {
          const errorMsg = body.mensagem || 'Ocorreu um erro de negócio não especificado.';
          
          // Lança um erro para que o componente/service possa tratar
          throw new Error(errorMsg); 
        }
        
        // Se for sucesso (cod_retorno: 0), retorna o evento sem o envelope.
        // O `data` deve ser extraído no service chamador.
        return event;
      }
      return event;
    }),

    // 2. Processa Erros HTTP padrão (401, 404, 500)
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ocorreu um erro desconhecido.';
      
      // Verifica se ErrorEvent existe (não está disponível em SSR)
      if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
        // Erro no lado do cliente/rede
        errorMsg = `Erro de Rede: ${error.error.message}`;
      } else if (error.status !== 0) {
        // Erro retornado pelo backend (4xx ou 5xx)
        errorMsg = `Erro ${error.status}: ${error.statusText}`;

        // Se a resposta de erro 4xx/5xx ainda vier no formato de envelope da API
        const apiError = error.error as ApiResponse<any>;
        if (apiError && apiError.mensagem) {
           errorMsg = apiError.mensagem;
        }

      } else {
           // Erro de conexão
           errorMsg = 'Serviço indisponível. Verifique sua conexão ou tente mais tarde.';
      }
      
      return throwError(() => new Error(errorMsg));
    })
  );
};