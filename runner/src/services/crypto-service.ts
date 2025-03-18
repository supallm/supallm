import { logger } from "../utils/logger";

export class CryptoService {
  constructor() {}

  decrypt(encryptedText: string): string {
    try {
      if (!encryptedText) {
        throw new Error("encryptedText is required");
      }

      return encryptedText;
    } catch (error) {
      logger.error(`error decrypting text: ${error}`);
      throw error;
    }
  }
}
