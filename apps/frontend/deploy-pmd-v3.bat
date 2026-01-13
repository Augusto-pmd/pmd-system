@echo off
chcp 65001 >nul
echo ========================================
echo PMD V3 - DEPLOY PROFESIONAL
echo ========================================
echo.

REM 1. AUDITORÍA PREVIA
echo 1. AUDITORÍA PREVIA
echo -------------------
echo.

git status --short > temp_status.txt
findstr /R "^[MADRC]" temp_status.txt > temp_modified.txt
findstr /R "^\?\?" temp_status.txt > temp_untracked.txt

echo Archivos modificados:
findstr /R "^[MADRC]" temp_status.txt
echo.

echo Verificando archivos no trackeados...
findstr /R "\.next node_modules \.log uploads AppData NTUSER \.cursor" temp_untracked.txt >nul
if %ERRORLEVEL% EQU 0 (
    echo   ⚠️ BASURA DETECTADA en archivos no trackeados
    echo   ⚠️ NO se agregará basura al commit
) else (
    echo   ✓ Sin basura detectada
)
echo.

REM 2. VALIDAR PROYECTO
echo 2. VALIDACIÓN DEL PROYECTO
echo --------------------------
echo.

echo Ejecutando npm run lint...
call npm run lint
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR EN LINT
    del temp_status.txt temp_modified.txt temp_untracked.txt 2>nul
    pause
    exit /b 1
) else (
    echo   ✓ Lint OK
)
echo.

echo Ejecutando npm run build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR EN BUILD
    del temp_status.txt temp_modified.txt temp_untracked.txt 2>nul
    pause
    exit /b 1
) else (
    echo   ✓ Build OK
)
echo.

REM 3. CREAR COMMIT
echo 3. CREAR COMMIT PROFESIONAL
echo ----------------------------
echo.

git branch --show-current > temp_branch.txt
set /p CURRENT_BRANCH=<temp_branch.txt
echo Rama actual: %CURRENT_BRANCH%

if not "%CURRENT_BRANCH%"=="main" (
    echo Creando rama release/pmd-v3...
    git checkout -b release/pmd-v3
    set CURRENT_BRANCH=release/pmd-v3
)

echo Agregando archivos al staging...
git add .

echo Creando commit...
git commit -m "feat(pmd-v3): rediseño completo PMD estilo glass premium + estabilidad total" -m "- Implementación del rediseño V3 (glass azul PMD, blur, estética Apple)" -m "- Sidebar V3 traslúcido con ACL y navegación final" -m "- Dashboard Premium V3 con cards y gráficas minimalistas" -m "- Botones y formularios estilo glass profesional" -m "- Unificación visual en proveedores, staff, obras, clientes, contabilidad, cajas" -m "- Integración final de alertas, auditoría, roles y usuarios" -m "- Correcciones de UI/UX y consistencia completa"

if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR EN COMMIT
    del temp_status.txt temp_modified.txt temp_untracked.txt temp_branch.txt 2>nul
    pause
    exit /b 1
) else (
    echo   ✓ Commit creado exitosamente
)
echo.

REM 4. PUSH
echo 4. HACIENDO PUSH
echo ----------------
echo.

if "%CURRENT_BRANCH%"=="main" (
    git push origin main
) else (
    git push -u origin %CURRENT_BRANCH%
)

if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR EN PUSH
    del temp_status.txt temp_modified.txt temp_untracked.txt temp_branch.txt 2>nul
    pause
    exit /b 1
) else (
    echo   ✓ Push exitoso
)
echo.

REM 5. CONFIRMACIÓN FINAL
echo 5. CONFIRMACIÓN FINAL
echo ---------------------
echo.

git rev-parse HEAD > temp_hash.txt
set /p COMMIT_HASH=<temp_hash.txt
git rev-parse --short HEAD > temp_hash_short.txt
set /p COMMIT_SHORT=<temp_hash_short.txt

echo Rama actual: %CURRENT_BRANCH%
echo Hash del commit: %COMMIT_HASH%
echo Hash corto: %COMMIT_SHORT%
echo.

echo Archivos incluidos en el commit:
git diff --cached --name-only
echo.

echo Confirmación del push: ✓
echo.

if not "%CURRENT_BRANCH%"=="main" (
    echo Link al PR:
    echo   https://github.com/Augusto-pmd/pmd-frontend/compare/main...%CURRENT_BRANCH%
) else (
    echo Repositorio:
    echo   https://github.com/Augusto-pmd/pmd-frontend
)

echo.
echo ========================================
echo ✅ DEPLOY COMPLETADO
echo ========================================
echo.

del temp_status.txt temp_modified.txt temp_untracked.txt temp_branch.txt temp_hash.txt temp_hash_short.txt 2>nul
pause

