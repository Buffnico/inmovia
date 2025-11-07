# Checklist de Pruebas y Dataset sugerido

## Dataset sugerido
- Contratos impresos (2-3 páginas) con zonas claras/oscuras.
- Recibos (papel térmico) con bajo contraste.
- DNI (frente y dorso) con reflejos.
- Fotos con sombras pronunciadas y papel arrugado.
- Imágenes con baja luz y con flash.

## Pruebas
1. **Detección de bordes** en cámara y con archivo subido (≥ 95% en luz normal).
2. **Corrección de perspectiva**: verificar que no haya deformación visible.
3. **De-shadow + CLAHE**: mejora local de contraste, texto legible.
4. **Binarización (B/N)**: que el texto sea legible sin artefactos fuertes.
5. **Multi-página**: agregar 3-5 páginas, reordenar y eliminar.
6. **Exportar PDF**: tamaño final < 300 KB/página (dependiente de resolución/compresión).
7. **OCR (opcional)**: si se activa, que devuelva texto consistente en español/inglés.
8. **Subida a API**: ver que `/api/documentos` devuelve `ok: true` y metadata correcta.
9. **PWA**: instalación en escritorio/móvil y funcionamiento offline básico.

## Métricas (objetivo)
- Detección: ≥ 95% en luz normal.
- Tiempo de procesamiento: < 1.5 s/página en notebooks medias.
- Tamaño exportado: < 300 KB/página.

## Medición
- En el front, medir con `performance.now()` entre clicks y `process:result`.
- Contar páginas y tiempos por lote; mostrar en consola para inspección.
