using System;
using System.Collections.Generic;

namespace Api.Contracts.Orders
{
    public class CreateOrderRequest
    {
        public Guid CustomerId { get; set; }
        public List<CreateOrderItemRequest> Items { get; set; } = new();
    }

    public class CreateOrderItemRequest
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
