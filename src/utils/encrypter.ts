import crypto from 'node:crypto'
import { getErrorMessage } from './errorHandler'

export const encrypt = (plainText: string, secrectKey: string): string => {
  try {
    const iv = crypto.randomBytes(16)
    const key = crypto
      .createHash('sha256')
      .update(secrectKey)
      .digest('base64')
      .substring(0, 32)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

    let encrypted = cipher.update(plainText)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
