// Encryption utilities for sensitive data
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

// Generate a cryptographic key from a password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

// Get or create master key (stored in session storage for security)
async function getMasterKey(): Promise<string> {
  let masterKey = sessionStorage.getItem("restify_mk");
  if (!masterKey) {
    // Generate a random master key
    const keyBytes = new Uint8Array(32);
    crypto.getRandomValues(keyBytes);
    masterKey = Array.from(keyBytes, (b) => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem("restify_mk", masterKey);
  }
  return masterKey;
}

// Encrypt sensitive data
export async function encrypt(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive key from master key
    const masterKey = await getMasterKey();
    const key = await deriveKey(masterKey, salt);

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, data);

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

// Decrypt sensitive data
export async function decrypt(ciphertext: string): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

    // Derive key from master key
    const masterKey = await getMasterKey();
    const key = await deriveKey(masterKey, salt);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);

    // Decode and return
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

// Hash data (for non-reversible storage like password verification)
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Clear master key (on logout/session end)
export function clearMasterKey(): void {
  sessionStorage.removeItem("restify_mk");
}
