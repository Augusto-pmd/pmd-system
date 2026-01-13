# PMD V3 - Script de Deploy Profesional
# Ejecutar desde el directorio del proyecto: pmd-frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PMD V3 - DEPLOY PROFESIONAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. AUDITORÍA PREVIA
Write-Host "1. AUDITORÍA PREVIA" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

$status = git status --short
$modified = $status | Where-Object { $_ -match '^\s*M' } | ForEach-Object { ($_ -replace '^\s*M\s+', '').Trim() }
$added = $status | Where-Object { $_ -match '^\s*A' } | ForEach-Object { ($_ -replace '^\s*A\s+', '').Trim() }
$deleted = $status | Where-Object { $_ -match '^\s*D' } | ForEach-Object { ($_ -replace '^\s*D\s+', '').Trim() }
$untracked = $status | Where-Object { $_ -match '^\?\?' } | ForEach-Object { ($_ -replace '^\?\?\s+', '').Trim() }

Write-Host "Archivos modificados: $($modified.Count)" -ForegroundColor Green
if ($modified.Count -gt 0) { $modified | ForEach-Object { Write-Host "  M $_" -ForegroundColor Gray } }

Write-Host "Archivos nuevos: $($added.Count)" -ForegroundColor Green
if ($added.Count -gt 0) { $added | ForEach-Object { Write-Host "  A $_" -ForegroundColor Gray } }

Write-Host "Archivos eliminados: $($deleted.Count)" -ForegroundColor Green
if ($deleted.Count -gt 0) { $deleted | ForEach-Object { Write-Host "  D $_" -ForegroundColor Gray } }

Write-Host "Archivos no trackeados: $($untracked.Count)" -ForegroundColor Yellow
if ($untracked.Count -gt 0) {
    $junk = $untracked | Where-Object { 
        $_ -match '\.next|node_modules|\.log|uploads|AppData|NTUSER|\.cursor' 
    }
    if ($junk.Count -gt 0) {
        Write-Host "  ⚠️ BASURA DETECTADA:" -ForegroundColor Red
        $junk | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        Write-Host "  ⚠️ NO se agregará basura al commit" -ForegroundColor Red
    }
}

Write-Host ""

# 2. VALIDAR PROYECTO
Write-Host "2. VALIDACIÓN DEL PROYECTO" -ForegroundColor Yellow
Write-Host "--------------------------" -ForegroundColor Yellow

Write-Host "Ejecutando npm run lint..." -ForegroundColor Cyan
$lintResult = npm run lint 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ ERROR EN LINT" -ForegroundColor Red
    Write-Host $lintResult
    exit 1
} else {
    Write-Host "  ✓ Lint OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "Ejecutando npm run build..." -ForegroundColor Cyan
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ ERROR EN BUILD" -ForegroundColor Red
    Write-Host $buildResult
    exit 1
} else {
    Write-Host "  ✓ Build OK" -ForegroundColor Green
}

Write-Host ""

# 3. CREAR COMMIT
Write-Host "3. CREAR COMMIT PROFESIONAL" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

$branch = git branch --show-current
Write-Host "Rama actual: $branch" -ForegroundColor Cyan

if ($branch -ne "main") {
    Write-Host "Creando rama release/pmd-v3..." -ForegroundColor Cyan
    git checkout -b release/pmd-v3
    $branch = "release/pmd-v3"
}

# Agregar solo archivos del proyecto (excluir basura)
Write-Host "Agregando archivos al staging..." -ForegroundColor Cyan
git add .

# Verificar que no se agregó basura
$staged = git diff --cached --name-only
$junkStaged = $staged | Where-Object { 
    $_ -match '\.next|node_modules|\.log|uploads|AppData|NTUSER|\.cursor' 
}
if ($junkStaged.Count -gt 0) {
    Write-Host "  ⚠️ BASURA EN STAGING - Removiendo..." -ForegroundColor Red
    $junkStaged | ForEach-Object { git reset HEAD $_ }
}

$commitMessage = @"
feat(pmd-v3): rediseño completo PMD estilo glass premium + estabilidad total

- Implementación del rediseño V3 (glass azul PMD, blur, estética Apple)
- Sidebar V3 traslúcido con ACL y navegación final
- Dashboard Premium V3 con cards y gráficas minimalistas
- Botones y formularios estilo glass profesional
- Unificación visual en proveedores, staff, obras, clientes, contabilidad, cajas
- Integración final de alertas, auditoría, roles y usuarios
- Correcciones de UI/UX y consistencia completa
"@

Write-Host "Creando commit..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ ERROR EN COMMIT" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  ✓ Commit creado exitosamente" -ForegroundColor Green
}

Write-Host ""

# 4. PUSH
Write-Host "4. HACIENDO PUSH" -ForegroundColor Yellow
Write-Host "----------------" -ForegroundColor Yellow

if ($branch -eq "main") {
    git push origin main
} else {
    git push -u origin $branch
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ ERROR EN PUSH" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  ✓ Push exitoso" -ForegroundColor Green
}

Write-Host ""

# 5. CONFIRMACIÓN FINAL
Write-Host "5. CONFIRMACIÓN FINAL" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow

$commitHash = git rev-parse HEAD
$commitShort = git rev-parse --short HEAD
$filesIncluded = git diff --cached --name-only

Write-Host "Rama actual: $branch" -ForegroundColor Cyan
Write-Host "Hash del commit: $commitHash" -ForegroundColor Cyan
Write-Host "Hash corto: $commitShort" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivos incluidos en el commit:" -ForegroundColor Green
$filesIncluded | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host ""
Write-Host "Confirmación del push: ✓" -ForegroundColor Green
Write-Host ""

if ($branch -ne "main") {
    Write-Host "Link al PR:" -ForegroundColor Cyan
    Write-Host "  https://github.com/Augusto-pmd/pmd-frontend/compare/main...$branch" -ForegroundColor Blue
} else {
    Write-Host "Repositorio:" -ForegroundColor Cyan
    Write-Host "  https://github.com/Augusto-pmd/pmd-frontend" -ForegroundColor Blue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOY COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

