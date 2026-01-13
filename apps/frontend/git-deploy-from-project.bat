@echo off
chcp 65001 >nul
echo ========================================
echo PMD FRONTEND - GIT DEPLOY DESDE PROYECTO
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encuentra package.json
    echo Por favor, ejecuta este script desde el directorio del proyecto:
    echo C:\Users\augus\PMD ADMIN Dropbox\Augusto Menendez\SOFTWARE PMD\pmd-frontend
    pause
    exit /b 1
)

if not exist "app" (
    echo ERROR: No se encuentra el directorio app/
    echo Por favor, ejecuta este script desde el directorio del proyecto
    pause
    exit /b 1
)

echo ✓ Directorio correcto verificado
echo.

REM 1. Verificar git
echo 1. VERIFICANDO GIT...
echo --------------------
git status --short | findstr /R "^[MADRC]" >nul
if %ERRORLEVEL% EQU 0 (
    echo   ✓ Hay archivos modificados para commitear
) else (
    echo   ⚠️ No hay cambios para commitear
)

git remote -v
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR: No hay remoto configurado
    pause
    exit /b 1
)

git branch --show-current
echo.

REM 2. Crear archivo de deploy
echo 2. CREANDO ARCHIVO FORCE_DEPLOY_VERCEL.txt...
echo ----------------------------------------------
echo Force deploy trigger for Vercel > FORCE_DEPLOY_VERCEL.txt
echo Updated: %date% %time% >> FORCE_DEPLOY_VERCEL.txt
echo   ✓ Archivo creado
echo.

REM 3. Agregar solo archivos del proyecto (excluir basura)
echo 3. AGREGANDO ARCHIVOS AL STAGING...
echo -----------------------------------
git add FORCE_DEPLOY_VERCEL.txt
git add .gitignore
git add components/
git add app/
git add lib/
git add hooks/
git add store/
git add styles/
git add public/
git add *.json
git add *.js
git add *.ts
git add *.tsx
git add *.css
git add *.md
git add *.bat
git add *.ps1
git add middleware.ts
git add next.config.js
git add tailwind.config.ts
git add tsconfig.json
git add postcss.config.js
git add vercel.json

REM Excluir archivos basura explícitamente
git reset HEAD AppData/ 2>nul
git reset HEAD ".cursor/" 2>nul
git reset HEAD ".vscode/" 2>nul
git reset HEAD "node_modules/" 2>nul
git reset HEAD "NTUSER.DAT*" 2>nul
git reset HEAD "ntuser.*" 2>nul
git reset HEAD "OneDrive/" 2>nul
git reset HEAD "PMD ADMIN Dropbox/" 2>nul

echo   ✓ Archivos agregados (excluyendo basura)
echo.

REM 4. Verificar qué se va a commitear
echo 4. ARCHIVOS EN STAGING:
echo -----------------------
git diff --cached --name-only
echo.

REM 5. Crear commit
echo 5. CREANDO COMMIT...
echo --------------------
git commit -m "Real deploy update: frontend changes applied from correct directory"
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR: No se pudo crear el commit
    pause
    exit /b 1
)
echo   ✓ Commit creado exitosamente
echo.

REM 6. Push
echo 6. HACIENDO PUSH...
echo -------------------
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR: No se pudo hacer push
    pause
    exit /b 1
)
echo   ✓ Push exitoso
echo.

REM 7. Confirmación
echo 7. CONFIRMACIÓN FINAL
echo ---------------------
git log --oneline -1
echo.
echo ========================================
echo ✅ DEPLOY COMPLETADO
echo ========================================
echo.
echo Frontend actualizado correctamente desde el directorio real.
echo Vercel recibirá el nuevo commit.
echo.
pause

