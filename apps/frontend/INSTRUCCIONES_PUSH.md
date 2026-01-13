# INSTRUCCIONES: Push a GitHub

## Pasos Simples

### 1. Abre una terminal en el directorio del proyecto

**Opción A: Desde el Explorador de Windows**
- Navega a: `C:\Users\augus\PMD ADMIN Dropbox\Augusto Menéndez\SOFTWARE PMD\pmd-frontend`
- Haz clic derecho en la carpeta
- Selecciona "Git Bash Here" o "Abrir en Terminal"

**Opción B: Desde CMD**
```cmd
cd "C:\Users\augus\PMD ADMIN Dropbox\Augusto Menéndez\SOFTWARE PMD\pmd-frontend"
```

### 2. Ejecuta el script

```cmd
push-to-github.bat
```

O si estás en Git Bash:
```bash
./push-to-github.bat
```

### 3. El script hará automáticamente:

1. ✅ Verifica que estás en el directorio correcto
2. ✅ Verifica el remoto Git (debe mostrar origin)
3. ✅ Muestra la rama actual
4. ✅ Agrega todos los archivos del proyecto
5. ✅ Muestra qué archivos se van a commitear
6. ✅ Crea el commit
7. ✅ Hace push a GitHub
8. ✅ Muestra confirmación final

### 4. Verifica en GitHub

Después del push exitoso:
- Ve a: https://github.com/Augusto-pmd/pmd-frontend
- Verifica que el último commit aparezca
- Vercel detectará el cambio automáticamente

## Si hay errores

### Error: "No se encuentra package.json"
- Asegúrate de estar en el directorio correcto del proyecto

### Error: "No hay remoto configurado"
- Verifica con: `git remote -v`
- Si no hay remoto, agrega: `git remote add origin https://github.com/Augusto-pmd/pmd-frontend.git`

### Error: "No se pudo hacer push"
- Verifica tu conexión a internet
- Verifica tus credenciales de GitHub
- Intenta: `git push origin main` manualmente

## Comandos Manuales (Alternativa)

Si prefieres hacerlo manualmente:

```bash
# 1. Verificar remoto
git remote -v

# 2. Agregar archivos
git add .

# 3. Ver qué se va a commitear
git status

# 4. Crear commit
git commit -m "Real deploy update: frontend changes applied from correct directory"

# 5. Push
git push origin main
```

