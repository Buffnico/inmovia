/* global self, cv */
(function () {
  function reply(id, ok, payloadOrError) {
    self.postMessage(ok ? { __for: id, ok: true, payload: payloadOrError }
                       : { __for: id, ok: false, error: String(payloadOrError || "Error") });
  }

  function asClamped(data) {
    // Acepta ImageData.data (Uint8ClampedArray) o ArrayLike, y crea SIEMPRE una copia segura
    if (data instanceof Uint8ClampedArray) return new Uint8ClampedArray(data);
    if (data && data.buffer) return new Uint8ClampedArray(new Uint8Array(data).slice(0));
    return new Uint8ClampedArray(data);
  }

  function imageDataFromPayload(p) {
    const arr = asClamped(p.data);
    return new ImageData(arr, p.width, p.height);
    // No transferimos 'arr.buffer' al main thread. El worker maneja su copia.
  }

  async function canvasFromImageData(id) {
    const c = new OffscreenCanvas(id.width, id.height);
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.putImageData(id, 0, 0);
    return c;
  }

  async function blobToBytes(blob) {
    const ab = await blob.arrayBuffer();
    return new Uint8Array(ab);
  }

  // ==== Filtros JS (sin OpenCV) ====
  function enhanceJS(id, opts) {
    const { deshadow = 5, contrast = 6, binarize = 0 } = opts || {};
    const data = new Uint8ClampedArray(id.data); // copia
    // gris
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const y = (r*0.299 + g*0.587 + b*0.114);
      data[i] = data[i+1] = data[i+2] = y;
    }
    // quitar sombras simple: top-hat vía blur-resta (rápido)
    const k = Math.max(1, Math.min(25, Math.round(deshadow*2+1)));
    const blurred = boxBlurGray(data, id.width, id.height, k);
    for (let i=0;i<data.length;i+=4){
      let v = data[i] - (blurred[i] - 128); // compensa sombras suaves
      data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,v));
    }
    // contraste local simple
    const cFactor = (contrast/5); // ~0.2..2
    for (let i=0;i<data.length;i+=4){
      let v = data[i];
      v = (v-128)*cFactor + 128;
      data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,v));
    }
    // binarización opcional
    if (binarize>0){
      const t = 220 - Math.min(10, binarize)*15; // umbral descendente
      for (let i=0;i<data.length;i+=4){
        const v = data[i] >= t ? 255 : 0;
        data[i]=data[i+1]=data[i+2]=v;
      }
    }
    return new ImageData(data, id.width, id.height);
  }

  // blur de caja naive (rápido, suficiente)
  function boxBlurGray(src, w, h, r) {
    const dst = new Uint8ClampedArray(src.length);
    const tmp = new Float32Array(w*h);
    const div = r;
    // horizontal
    for (let y=0;y<h;y++){
      let sum=0;
      for (let x=0;x<w;x++){
        const i = (y*w + x)*4;
        sum += src[i];
        if (x>=div) sum -= src[(y*w + (x-div))*4];
        const x2 = x-div+1;
        if (x2>=0){
          tmp[y*w + x2] = sum / Math.min(div, x+1);
        }
      }
    }
    // vertical
    for (let x=0;x<w;x++){
      let sum=0;
      for (let y=0;y<h;y++){
        sum += tmp[y*w + x];
        if (y>=div) sum -= tmp[(y-div)*w + x];
        const y2 = y-div+1;
        if (y2>=0){
          const v = sum / Math.min(div, y+1);
          const i = (y2*w + x)*4;
          dst[i]=dst[i+1]=dst[i+2]=Math.max(0,Math.min(255, v|0));
          dst[i+3]=255;
        }
      }
    }
    return dst;
  }

  // recorte por bounding box del quad (sin perspectiva)
  function cropBBox(id, quad) {
    const xs = quad.map(p=>p.x), ys = quad.map(p=>p.y);
    const minX = Math.max(0, Math.min(...xs)|0);
    const minY = Math.max(0, Math.min(...ys)|0);
    const maxX = Math.min(id.width, Math.max(...xs)|0);
    const maxY = Math.min(id.height, Math.max(...ys)|0);
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const c = new OffscreenCanvas(w,h);
    const ctx = c.getContext("2d");
    const src = new OffscreenCanvas(id.width, id.height);
    src.getContext("2d").putImageData(id,0,0);
    ctx.drawImage(src, minX, minY, w, h, 0, 0, w, h);
    const out = ctx.getImageData(0,0,w,h);
    return out;
  }

  async function toBytesPNG(id) {
    const c = await canvasFromImageData(id);
    const b = await c.convertToBlob({ type: "image/png" });
    return { mime: "image/png", bytes: await blobToBytes(b) };
  }

  // ==== OpenCV helpers (opcionales) ====
  const hasCV = typeof cv !== "undefined" && cv && typeof cv.Mat === "function";

  function idToMatGray(id) {
    const mat = cv.matFromImageData(id);
    const gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    mat.delete();
    return gray;
  }

  function matToPNGBytes(mat) {
    const rgba = new cv.Mat();
    cv.cvtColor(mat, rgba, cv.COLOR_GRAY2RGBA);
    const imageData = new ImageData(new Uint8ClampedArray(rgba.data), rgba.cols, rgba.rows);
    rgba.delete();
    const c = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = c.getContext("2d"); ctx.putImageData(imageData,0,0);
    return c.convertToBlob({ type: "image/png" }).then(blobToBytes).then(bytes => ({ mime:"image/png", bytes }));
  }

  self.onmessage = async (e) => {
    const { __id, op, payload } = e.data || {};
    if (!__id) return;

    try {
      if (op === "ping") {
        reply(__id, true, { cvReady: !!hasCV });
        return;
      }

      if (op === "enhance") {
        const id = imageDataFromPayload(payload);
        const out = enhanceJS(id, payload);
        const res = await toBytesPNG(out);
        reply(__id, true, res);
        return;
      }

      if (op === "cropBBox") {
        const id = imageDataFromPayload(payload);
        if (!payload.quad) throw new Error("Quad requerido");
        const out = cropBBox(id, payload.quad);
        const res = await toBytesPNG(out);
        reply(__id, true, res);
        return;
      }

      if (!hasCV) {
        // Cualquier otra operación requiere OpenCV
        throw new Error("Operación no soportada sin OpenCV");
      }

      if (op === "autoDetect") {
        const id = imageDataFromPayload(payload);
        const gray = idToMatGray(id);
        const blurred = new cv.Mat();
        cv.GaussianBlur(gray, blurred, new cv.Size(5,5), 0);
        const edges = new cv.Mat();
        cv.Canny(blurred, edges, 75, 200);
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
        let best = null, bestArea = 0;
        for (let i=0;i<contours.size();i++){
          const c = contours.get(i);
          const peri = cv.arcLength(c, true);
          const approx = new cv.Mat();
          cv.approxPolyDP(c, approx, 0.02*peri, true);
          if (approx.rows === 4){
            const area = cv.contourArea(approx);
            if (area > bestArea) { bestArea = area; best = approx; }
            else approx.delete();
          } else approx.delete();
          c.delete();
        }
        let quad = null;
        if (best){
          quad = [];
          for (let i=0;i<4;i++){
            quad.push({ x: best.intAt(i,0), y: best.intAt(i,1) });
          }
          best.delete();
        }
        gray.delete(); blurred.delete(); edges.delete(); contours.delete(); hierarchy.delete();
        reply(__id, true, { quad });
        return;
      }

      if (op === "warp") {
        const id = imageDataFromPayload(payload);
        if (!payload.quad) throw new Error("Quad requerido");
        const src = cv.matFromImageData(id);
        const pts = payload.quad;
        // ordenar puntos (aprox): top-left, top-right, bottom-right, bottom-left
        pts.sort((a,b)=>a.y-b.y);
        const top = pts.slice(0,2).sort((a,b)=>a.x-b.x);
        const bottom = pts.slice(2,4).sort((a,b)=>a.x-b.x);
        const ordered = [top[0], top[1], bottom[1], bottom[0]];
        const w = Math.hypot(ordered[1].x-ordered[0].x, ordered[1].y-ordered[0].y) |0;
        const w2 = Math.hypot(ordered[2].x-ordered[3].x, ordered[2].y-ordered[3].y) |0;
        const h = Math.hypot(ordered[3].x-ordered[0].x, ordered[3].y-ordered[0].y) |0;
        const h2 = Math.hypot(ordered[2].x-ordered[1].x, ordered[2].y-ordered[1].y) |0;
        const W = Math.max(w,w2,1), H = Math.max(h,h2,1);
        const srcTri = cv.matFromArray(4,1,cv.CV_32FC2, ordered.flatMap(p=>[p.x,p.y]));
        const dstTri = cv.matFromArray(4,1,cv.CV_32FC2,[0,0, W,0, W,H, 0,H]);
        const M = cv.getPerspectiveTransform(srcTri, dstTri);
        const dst = new cv.Mat();
        cv.warpPerspective(src, dst, M, new cv.Size(W,H), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
        const bytes = await matToPNGBytes(dst);
        src.delete(); dst.delete(); srcTri.delete(); dstTri.delete(); M.delete();
        reply(__id, true, bytes);
        return;
      }

      if (op === "opencvPipeline") {
        const id = imageDataFromPayload(payload);
        const {
          gaussian=3, tophat=5, median=3, claheClip=3, claheTile=8,
          bilateral=0, binarize=0
        } = payload || {};
        let gray = idToMatGray(id);
        if (gaussian>0) cv.GaussianBlur(gray, gray, new cv.Size(gaussian|1, gaussian|1), 0, 0, cv.BORDER_DEFAULT);
        if (tophat>0) {
          const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size((tophat|1), (tophat|1)));
          const morph = new cv.Mat();
          cv.morphologyEx(gray, morph, cv.MORPH_BLACKHAT, kernel);
          cv.add(gray, morph, gray);
          kernel.delete(); morph.delete();
        }
        if (median>0) cv.medianBlur(gray, gray, median|1);
        if (claheClip>0) {
          const clahe = new cv.CLAHE(claheClip, new cv.Size(claheTile, claheTile));
          clahe.apply(gray, gray); clahe.delete();
        }
        if (bilateral>0) {
          const dst = new cv.Mat();
          cv.bilateralFilter(gray, dst, 5 + bilateral*2, 75, 75);
          gray.delete(); gray = dst;
        }
        if (binarize>0) {
          const dst = new cv.Mat();
          cv.adaptiveThreshold(gray, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 15, 10);
          gray.delete(); gray = dst;
        }
        const out = await matToPNGBytes(gray);
        gray.delete();
        reply(__id, true, out);
        return;
      }

      throw new Error("Operación no soportada");
    } catch (e) {
      reply(__id, false, e && e.message ? e.message : String(e));
    }
  };
})();
