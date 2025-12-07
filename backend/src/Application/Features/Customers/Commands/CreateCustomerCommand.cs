// Application/Features/Customers/Commands/CreateCustomerCommand.cs
using System;

namespace Application.Features.Customers.Commands
{
    public record CreateCustomerCommand(
        string Name,
        string Email,
        string Document
    );

    public record UpdateCustomerCommand(
        Guid Id,
        string Name,
        string Email,
        string Document
    );

    public record DeleteCustomerCommand(Guid Id);
}