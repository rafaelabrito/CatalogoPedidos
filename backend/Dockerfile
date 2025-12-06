# backend/Dockerfile
# -----------------------------------
# STAGE 1: Build da Aplicação .NET
# -----------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia a solução e o código fonte
COPY backend.sln ./
COPY src/ ./src/

# Restaura dependências e publica em Release
RUN dotnet restore ./backend.sln
WORKDIR /src/src/Api
RUN dotnet publish Api.csproj -c Release -o /app/publish


# -----------------------------------
# STAGE 2: Imagem Final (Runtime)
# -----------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

# Ponto de entrada da API
ENTRYPOINT ["dotnet", "Api.dll"]