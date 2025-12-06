# backend/Dockerfile
# -----------------------------------
# STAGE 1: Build da Aplicação .NET
# -----------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia apenas os arquivos de projeto para otimizar o cache de restore
COPY src/Api/Api.csproj src/Api/
COPY src/Application/Application.csproj src/Application/
COPY src/Domain/Domain.csproj src/Domain/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/

# Restaura dependências usando o projeto da API
RUN dotnet restore src/Api/Api.csproj

# Copia todo o restante do código-fonte e publica em Release
COPY . .
RUN dotnet publish src/Api/Api.csproj -c Release -o /app/publish --no-restore


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