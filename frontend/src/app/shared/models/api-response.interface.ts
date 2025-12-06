// src/app/shared/models/api-response.interface.ts

export interface ApiResponse<T> {
  cod_retorno: 0 | 1; // 0 para sucesso, 1 para erro 
  mensagem: string | null; // Opcional, descreve erro/aviso 
  data: T | null; // Payload da operação [cite: 49]
}