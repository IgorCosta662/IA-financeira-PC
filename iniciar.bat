@echo off
:: Finança AI Ultimate - Iniciar Aplicação
title Financa AI Ultimate - Inicializador
chcp 65001 > nul

echo =======================================================
echo          INICIALIZADOR - FINANÇA AI ULTIMATE          
echo =======================================================
echo.

:: Verificar se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js não foi encontrado no sistema.
    echo Por favor, instale o Node.js v18+ de https://nodejs.org/ antes de prosseguir.
    echo.
    pause
    exit /b 1
)

:: Verificar se a pasta node_modules existe
if not exist "node_modules\" (
    echo [INFO] Pasta "node_modules" não encontrada. Instalando dependências necessárias...
    echo Isso pode levar alguns instantes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependências. Verifique sua conexão ou permissões.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCESSO] Dependências instaladas com sucesso!
    echo.
)

echo [INFO] Iniciando o servidor de desenvolvimento na porta 3000...
echo Abra seu navegador em: http://localhost:3000
echo.
echo Para fechar o servidor, pressione CTRL+C nesta janela.
echo =======================================================
echo.

:: Iniciar servidor
call npm run dev

echo.
echo Servidor finalizado.
pause
