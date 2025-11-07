# Riesgos y Mitigaciones

## Performance en móviles
- **Riesgo**: WASM y procesamiento de imágenes pueden ser pesados.
- **Mitigación**: reducción de tamaño previo, procesamiento en Web Workers, ajustar calidad JPEG.

## Permisos de cámara (Safari iOS)
- **Riesgo**: restricciones de autoplay/permiso.
- **Mitigación**: pedir permiso explícito, permitir subir imagen como fallback.

## Tamaño de OpenCV WASM
- **Riesgo**: carga inicial algo lenta.
- **Mitigación**: carga en worker on-demand, mostrar estado y permitir subir imagen local.

## OCR en el dispositivo
- **Riesgo**: latencia y consumo de CPU.
- **Mitigación**: dejarlo opcional (stub) u ofrecer endpoint en servidor.

## PDF/A estricto
- **Riesgo**: pdf-lib no garantiza conformidad PDF/A-1/2 full.
- **Mitigación**: exportación compatible y metadatos; para cumplimiento estricto, usar pipeline server-side con Ghostscript/PDFBox.
