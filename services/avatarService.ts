'use client'

import { createClient } from '@/lib/supabase/client'

const BUCKET = 'avatars'
const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type AvatarUploadResult =
  | { success: true; publicUrl: string }
  | { success: false; error: string }


function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Format non supporté. Utilisez JPG, PNG ou WebP.'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `La photo doit faire moins de ${MAX_SIZE_MB} Mo.`
  }
  return null
}


async function compressImage(file: File, maxWidth = 400): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          resolve(blob ?? file)
        },
        'image/webp',
        0.85
      )
    }
    img.src = url
  })
}


export async function uploadAvatar(
  file: File,
  authUid: string,
  onProgress?: (pct: number) => void
): Promise<AvatarUploadResult> {
  const validationError = validateFile(file)
  if (validationError) return { success: false, error: validationError }

  try {
    onProgress?.(10)
    const compressed = await compressImage(file)
    onProgress?.(40)

    const supabase = createClient()
    const path = `${authUid}/avatars.webp`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, {
        contentType: 'image/webp',
        upsert: true, // remplace le fichier existant
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('[uploadAvatar]', uploadError.message)
      return { success: false, error: "Erreur lors de l'upload." }
    }

    onProgress?.(80)

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

    onProgress?.(100)
    return { success: true, publicUrl }
  } catch (err) {
    console.error('[uploadAvatar] exception:', err)
    return { success: false, error: 'Erreur inattendue.' }
  }
}


export async function deleteAvatar(authUid: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const path = `${authUid}/avatar.webp`
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) {
      console.error('[deleteAvatar]', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('[deleteAvatar] exception:', err)
    return false
  }
}