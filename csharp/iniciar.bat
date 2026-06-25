@echo off
:: Finança AI Ultimate C# Edition - Iniciar Backend
title Financa AI - Backend C# .NET 8
chcp 65001 > nul

echo =======================================================
echo          INICIALIZADOR - FINANÇA AI BACKEND C#         
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

echo [INFO] Restaurando pacotes NuGet...
call dotnet restore
if %errorlevel% neq 0 (
    echo [AVISO] Falha na restauração automática de pacotes. Tentando compilar mesmo assim...
    echo.
)

echo [INFO] Compilando o projeto...
call dotnet build -c Debug
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar a aplicação C#. Verifique o código.
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCESSO] Aplicação compilada!
echo [INFO] Iniciando o servidor de desenvolvimento C# em http://localhost:5000...
echo Acesse a documentação Swagger interativa em: http://localhost:5000/swagger
echo.
echo Para fechar o servidor, pressione CTRL+C nesta janela.
echo =======================================================
echo.

:: Executar
call dotnet run

echo.
echo Servidor C# finalizado.
pause
