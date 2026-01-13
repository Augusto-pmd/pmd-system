@echo off
chcp 65001 >nul
echo ========================================
echo PMD FRONTEND - PUSH A GITHUB
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: No se encuentra package.json
    echo Por favor, ejecuta este script desde el directorio del proyecto
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

REM 1. Verificar remoto
echo 1. VERIFICANDO REMOTO GIT...
echo -----------------------------
git remote -v
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR: No hay remoto configurado
    pause
    exit /b 1
)
echo   ✓ Remoto configurado correctamente
echo.

REM 2. Verificar rama
echo 2. RAMA ACTUAL...
echo ----------------
git branch --show-current
echo.

REM 3. Mostrar estado
echo 3. ESTADO ACTUAL...
echo -------------------
git status --short | findstr /R "^[MADRC]" >nul
if %ERRORLEVEL% EQU 0 (
    echo   ✓ Hay archivos modificados
    git status --short | findstr /R "^[MADRC]"
) else (
    echo   ⚠️ No hay cambios para commitear
)
echo.

REM 4. Agregar archivos del proyecto
echo 4. AGREGANDO ARCHIVOS...
echo ------------------------
git add components/auth/LoginForm.tsx
git add store/authStore.ts
git add lib/normalizeUser.ts
git add lib/api.ts
git add lib/api-client.ts
git add .gitignore
git add FORCE_DEPLOY_VERCEL.txt
git add FORCE_DEPLOY.txt
git add deploy-pmd-v3.bat
git add deploy-pmd-v3.ps1
git add git-deploy-from-project.bat
git add SOLUCION_GIT_PUSH.md

REM Agregar cualquier otro cambio en directorios del proyecto
git add components/ 2>nul
git add app/ 2>nul
git add lib/ 2>nul
git add hooks/ 2>nul
git add store/ 2>nul
git add styles/ 2>nul
git add public/ 2>nul
git add *.json 2>nul
git add *.js 2>nul
git add *.ts 2>nul
git add *.tsx 2>nul
git add *.css 2>nul
git add *.md 2>nul
git add middleware.ts 2>nul
git add next.config.js 2>nul
git add tailwind.config.ts 2>nul
git add tsconfig.json 2>nul
git add postcss.config.js 2>nul
git add vercel.json 2>nul

echo   ✓ Archivos agregados
echo.

REM 5. Mostrar qué se va a commitear
echo 5. ARCHIVOS EN STAGING:
echo -----------------------
git diff --cached --name-only
if %ERRORLEVEL% NEQ 0 (
    echo   ⚠️ No hay archivos en staging
    echo   Verificando si hay cambios sin agregar...
    git status --short
    pause
    exit /b 1
)
echo.

REM 6. Crear commit
echo 6. CREANDO COMMIT...
echo -------------------
git commit -m "Real deploy update: frontend changes applied from correct directory"
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR: No se pudo crear el commit
    echo   Posible causa: No hay cambios para commitear
    pause
    exit /b 1
)
echo   ✓ Commit creado exitosamente
echo.

REM 7. Push
echo 7. HACIENDO PUSH A GITHUB...
echo ---------------------------
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ ERROR: No se pudo hacer push
    echo   Verifica tu conexión a internet y permisos de GitHub
    pause
    exit /b 1
)
echo   ✓ Push exitoso
echo.

REM 8. Confirmación
echo 8. CONFIRMACIÓN FINAL
echo ---------------------
git log --oneline -1
echo.
echo ========================================
echo ✅ PUSH COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Frontend actualizado en GitHub.
echo Vercel recibirá el nuevo commit automáticamente.
echo.
echo Repositorio: https://github.com/Augusto-pmd/pmd-frontend
echo.
pause
