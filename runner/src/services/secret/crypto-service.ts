import { Result } from "typescript-result";

export class CryptoService {
  constructor() {}

  decrypt(encryptedText: string): Result<string, CryptoError> {
    if (!encryptedText) {
      return Result.error(new CryptoError("encrypted text is required"));
    }

    return Result.ok(encryptedText);
  }
}

export class CryptoError extends Error {
  readonly type = "crypto-error";
}
