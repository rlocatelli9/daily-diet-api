import crypto from 'node:crypto'
import { getErrorMessage } from './errorHandler'

export const decrypt = (encryptedText: string, secrectKey: string): string => {
  try {
    const textParts = encryptedText.split(':')
    if (textParts.length >= 1) {
      const element = textParts.shift() as string
      const iv = Buffer.from(element, 'hex')
      const encryptedData = Buffer.from(textParts.join(':'), 'hex')
      const key = crypto
        .createHash('sha256')
        .update(secrectKey)
        .digest('base64')
        .substring(0, 32)
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

      const decrypted = decipher.update(encryptedData)
      const decryptedText = Buffer.concat([decrypted, decipher.final()])
      return decryptedText.toString()
    }
    throw new Error('Texto não suportado!')
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
