@echo off
:: Finança AI Ultimate C# Edition - Iniciar Programa
title Finança AI - Aplicativo de Console C#
chcp 65001 > nul

echo =======================================================
echo          INICIALIZADOR - FINANÇA AI EM C#              
echo =======================================================
echo.

:: Verificar se o .NET SDK está instalado
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O .NET SDK não foi encontrado no sistema.
    echo Por favor, instale o .NET 8 SDK ou superior de https://dot.net antes de prosseguir.
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

echo [INFO] Compilando o aplicativo...
call dotnet build -c Release > nul
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar o aplicativo C#. Verifique o código.
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCESSO] Aplicativo compilado com sucesso!
echo [INFO] Iniciando o aplicativo standalone em C#...
echo =======================================================
echo.

:: Executar o aplicativo compilado
call dotnet run -c Release

echo.
echo Aplicativo Finança AI C# finalizado.
pause

