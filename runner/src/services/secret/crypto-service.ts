import * as crypto from "crypto";
import { Result } from "typescript-result";
import config from "../../utils/config";

export class CryptoService {
  private envKey: Buffer;

  constructor() {
    this.envKey = Buffer.from(config.secretKey);
  }

  private deriveKey(key: Buffer): Buffer {
    if (key.length === 32) {
      return key;
    }

    return crypto.createHash("sha256").update(key).digest();
  }

  decrypt(encryptedText: string): Result<string, CryptoError> {
    if (!encryptedText) {
      return Result.error(new CryptoError("encrypted text is required"));
    }

    try {
      const ciphertext = Buffer.from(encryptedText, "hex");
      const key = this.deriveKey(this.envKey);
      const algorithm = "aes-256-gcm";
      const nonceSize = 12;
      const authTagSize = 16;

      if (ciphertext.length < nonceSize + authTagSize) {
        return Result.error(new CryptoError("ciphertext too short"));
      }

      const nonce = ciphertext.subarray(0, nonceSize);
      const actualCiphertext = ciphertext.subarray(
        nonceSize,
        ciphertext.length - authTagSize,
      );
      const authTag = ciphertext.subarray(ciphertext.length - authTagSize);

      const decipher = crypto.createDecipheriv(algorithm, key, nonce);
      decipher.setAuthTag(authTag);

      const plaintext = Buffer.concat([
        decipher.update(actualCiphertext),
        decipher.final(),
      ]);

      return Result.ok(plaintext.toString());
    } catch (error) {
      return Result.error(new CryptoError(`decryption failed`));
    }
  }
}

export class CryptoError extends Error {
  readonly type = "crypto-error";
}
