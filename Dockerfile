FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Backend/Amanote.Api/Amanote.Api.csproj Backend/Amanote.Api/
RUN dotnet restore Backend/Amanote.Api/Amanote.Api.csproj

COPY Backend/Amanote.Api/ Backend/Amanote.Api/
RUN dotnet publish Backend/Amanote.Api/Amanote.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "Amanote.Api.dll"]
