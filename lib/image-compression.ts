/**
 * Utilidad de compresión y redimensionamiento de imágenes en el cliente (Browser Canvas).
 * Evita desbordar la cuota de localStorage (5MB) y asegura transferencias ultrarrápidas a la API.
 */
export async function comprimirImagen(
  archivo: File,
  maxDimension: number = 1280,
  calidad: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si no es imagen, intentar leer directamente
    if (!archivo.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(archivo)
      return
    }

    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let width = img.width
        let height = img.height

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
          resolve(e.target?.result as string)
          return
        }

        // Suavizado de imagen de alta calidad
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a JPEG comprimido de alta fidelidad
        const formato = archivo.type === 'image/png' && archivo.size < 800 * 1024 ? 'image/png' : 'image/jpeg'
        const base64Comprimido = canvas.toDataURL(formato, calidad)
        resolve(base64Comprimido)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(archivo)
  })
}
