@echo off
:: Finança AI Ultimate C# Edition - Iniciar Desktop
title Finança AI - Aplicativo de Interface Gráfica C# (WPF)
chcp 65001 > nul

echo =======================================================
echo          INICIALIZADOR - FINANÇA AI GRAPHICAL UI
echo =======================================================
echo.

:: Check for .NET SDK
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O .NET SDK não foi encontrado no sistema!
    echo Por favor, instale o .NET 8 SDK para rodar este programa.
    echo Baixe em: https://dotnet.microsoft.com/en-us/download/dotnet/8.0
    echo.
    pause
    exit /b 1
)

echo [INFO] Restaurando dependências NuGet...
call dotnet restore
if %errorlevel% neq 0 (
    echo [AVISO] Falha na restauração. Tentando compilar mesmo assim...
    echo.
)

echo [INFO] Compilando a Interface Gráfica (WPF)...
call dotnet build -c Release > nul
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar a aplicação de desktop C#.
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCESSO] Aplicativo de Interface Gráfica compilado com sucesso!
echo [INFO] Iniciando o aplicativo de Desktop WPF...
echo =======================================================
echo.

:: Run compiled Desktop GUI application
call dotnet run -c Release

echo.
echo Aplicativo de Desktop Finança AI C# finalizado.
pause
