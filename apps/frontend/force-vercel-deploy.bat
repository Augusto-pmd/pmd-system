@echo off
chcp 65001 >nul
echo ========================================
echo Force Vercel Deploy - PMD Frontend
echo ========================================
echo.

echo 1. Verificando archivo FORCE_DEPLOY.txt...
if exist FORCE_DEPLOY.txt (
    echo    ✓ Archivo encontrado
) else (
    echo    ✗ Archivo no encontrado, creando...
    echo Force deploy trigger - Vercel build > FORCE_DEPLOY.txt
    echo Updated: %date% %time% >> FORCE_DEPLOY.txt
)

echo.
echo 2. Agregando archivo a git...
git add FORCE_DEPLOY.txt

echo.
echo 3. Creando commit...
git commit -m "Force deploy: trigger new Vercel build"

if %ERRORLEVEL% EQU 0 (
    echo    ✓ Commit creado exitosamente
) else (
    echo    ⚠️ No hay cambios para commitear o error en commit
)

echo.
echo 4. Haciendo push a GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ PUSH EXITOSO
    echo ========================================
    echo.
    echo Frontend actualizado en GitHub.
    echo Vercel debe iniciar un nuevo deploy automáticamente.
    echo.
    echo Repositorio: https://github.com/Augusto-pmd/pmd-frontend
    echo Rama: main
    echo.
) else (
    echo.
    echo ========================================
    echo ⚠️ ERROR EN PUSH
    echo ========================================
    echo.
    echo Verifica tu conexión y permisos de GitHub.
    echo.
)

pause

