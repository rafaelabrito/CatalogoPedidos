// backend/src/Domain/Entities/IdempotencyKey.cs

using System;

namespace Domain.Entities
{
    public class IdempotencyKey
    {
        // A chave primária é o GUID enviado no cabeçalho HTTP
        public string Key { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Outros dados de rastreamento podem ser adicionados aqui (e.g., UserId)
    }
}