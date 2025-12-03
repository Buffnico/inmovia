# Walkthrough: Activación de HomeLanding en Ruta Raíz

He configurado el router para asegurar que la ruta raíz `/` cargue exclusivamente la nueva **HomeLanding**, dejando la versión anterior (`HomeOld`) desconectada pero preservada como archivo.

## 1. Archivos Modificados

| Archivo | Acción | Descripción |
| :--- | :--- | :--- |
| `apps/web/src/router.tsx` | **Actualizado** | Se verificó que `HomeLanding` sea el único componente importado y asignado a la ruta `index` (`/`). Se eliminaron referencias a `Home` o `Landing` antiguos. |
| `apps/web/src/pages/HomeLanding.tsx` | **Verificado** | Contiene la nueva estructura (Hero 2 columnas, Beneficios, etc.) y se exporta correctamente. |
| `apps/web/src/pages/HomeOld.jsx` | **Preservado** | El archivo existe como backup pero ya no está conectado a ninguna ruta. |

## 2. Configuración de Rutas

En `router.tsx`, la configuración final para la raíz es:

```tsx
<Route path="/" element={<App />}>
  {/* Home Landing Pública (Nueva Versión) */}
  <Route index element={<HomeLanding />} />
  {/* ... resto de rutas ... */}
</Route>
```

Y en `App.tsx`, la lógica detecta la ruta `/` y renderiza el contenido limpio (sin sidebar):

```tsx
const isLanding = location.pathname === "/";
if (isLanding) return <Outlet />; // Renderiza HomeLanding
```

## 3. Verificación

1.  **Reiniciar Servidor**: Si aún ves la versión vieja, por favor detené y volvé a iniciar el servidor de desarrollo:
    ```bash
    # En la terminal de apps/web
    Ctrl+C
    npm run dev
    ```
2.  **Limpiar Caché**: A veces el navegador guarda la versión anterior. Probá abrir `http://localhost:5173/#/` en una ventana de Incógnito.
3.  **Resultado Esperado**: Deberías ver el título "Desbloqueá tu oficina digital" y el espacio para el video a la derecha.

La Home vieja (`HomeOld.jsx`) ya no es accesible públicamente, pero el código sigue en tu proyecto por seguridad.
