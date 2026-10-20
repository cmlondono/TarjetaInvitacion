/**
 * Utilidad de compresión y redimensionamiento de imágenes en el cliente (Browser Canvas).
 * Acepta cualquier imagen que el navegador sepa abrir (JPG, PNG, WebP, GIF, AVIF, BMP, SVG…):
 * - conserva la transparencia (sale en WebP, o PNG si el navegador no genera WebP);
 * - las fotos sin transparencia salen en JPG;
 * - los GIF se suben tal cual para no perder la animación;
 * - un SVG se convierte en imagen (así no puede llevar scripts).
 */

/** Tamaño máximo que acepta /api/imagenes */
const TAMANO_MAXIMO_SUBIDA = 6 * 1024 * 1024

export class ErrorFormatoImagen extends Error {}

function leerComoDataUrl(archivo: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new ErrorFormatoImagen('No se pudo leer el archivo.'))
    reader.readAsDataURL(archivo)
  })
}

/** ¿La imagen tiene zonas transparentes? (revisa una muestra de píxeles) */
function tieneTransparencia(ctx: CanvasRenderingContext2D, ancho: number, alto: number): boolean {
  const { data } = ctx.getImageData(0, 0, ancho, alto)
  const paso = Math.max(4, Math.floor(data.length / 4 / 40000)) * 4
  for (let i = 3; i < data.length; i += paso) if (data[i] < 250) return true
  return false
}

export async function comprimirImagen(
  archivo: File,
  maxDimension: number = 1280,
  calidad: number = 0.82
): Promise<string> {
  // GIF: se sube el archivo original para conservar la animación
  if (archivo.type === 'image/gif' && archivo.size <= TAMANO_MAXIMO_SUBIDA) return leerComoDataUrl(archivo)

  const original = await leerComoDataUrl(archivo)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () =>
      reject(new ErrorFormatoImagen('Este navegador no puede abrir ese formato de imagen. Prueba con JPG, PNG o WebP (las fotos HEIC del iPhone se pueden exportar como JPG).'))
    img.onload = () => {
      // Los SVG sin tamaño declarado llegan con 0: se dibujan a 1024 px
      let width = img.naturalWidth || img.width || 1024
      let height = img.naturalHeight || img.height || 1024

      // Redimensionar proporcionalmente si supera la dimensión máxima
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(original)
        return
      }

      // Suavizado de imagen de alta calidad
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Con transparencia: WebP (liviano y transparente). Si el navegador no genera WebP, devuelve PNG.
      // Sin transparencia: JPG de alta fidelidad.
      const transparente = tieneTransparencia(ctx, width, height)
      resolve(canvas.toDataURL(transparente ? 'image/webp' : 'image/jpeg', transparente ? 0.9 : calidad))
    }
    img.src = original
  })
}

function dataUrlABlob(dataUrl: string): Blob {
  const [cabecera, datos] = dataUrl.split(',')
  const tipo = cabecera.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
  const binario = atob(datos)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: tipo })
}

/**
 * Comprime una imagen en el navegador y la sube a Supabase Storage vía /api/imagenes.
 * Devuelve la URL pública que se guarda en la base de datos del evento.
 * Acepta un File o un data URL (por ejemplo, el resultado de un recorte).
 */
export async function subirImagen(
  origen: File | string,
  carpeta: string = 'general',
  maxDimension: number = 1600
): Promise<string> {
  const dataUrl = typeof origen === 'string' ? origen : await comprimirImagen(origen, maxDimension)

  try {
    const formulario = new FormData()
    const blob = dataUrlABlob(dataUrl)
    const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : blob.type === 'image/gif' ? 'gif' : 'jpg'
    formulario.append('archivo', blob, `imagen.${extension}`)
    formulario.append('carpeta', carpeta)

    const respuesta = await fetch('/api/imagenes', { method: 'POST', body: formulario })
    const resultado = await respuesta.json()
    if (respuesta.ok && resultado?.url) return resultado.url as string
    throw new Error(resultado?.error || 'Error subiendo imagen')
  } catch (err) {
    console.warn('No se pudo subir la imagen al almacenamiento, se guardará embebida:', err)
    return dataUrl
  }
}
