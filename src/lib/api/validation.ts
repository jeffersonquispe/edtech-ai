// Input validation helpers
export const MAX_TEXT_LENGTH = 5000;
export const MAX_TITLE_LENGTH = 200;

export function validateTitle(title: string | undefined): { valid: boolean; error?: string } {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'titulo es obligatorio' };
  }
  if (title.trim().length === 0) {
    return { valid: false, error: 'titulo no puede estar vacío' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `titulo debe tener menos de ${MAX_TITLE_LENGTH} caracteres` };
  }
  return { valid: true };
}

export function validateText(text: string | undefined, required = false): { valid: boolean; error?: string } {
  if (!text) {
    return required ? { valid: false, error: 'Este campo es obligatorio' } : { valid: true };
  }
  if (typeof text !== 'string') {
    return { valid: false, error: 'El texto debe ser un string' };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Máximo ${MAX_TEXT_LENGTH} caracteres` };
  }
  return { valid: true };
}

export function validatePrice(price: unknown): { valid: boolean; error?: string } {
  const num = Number(price ?? 0);
  if (isNaN(num)) {
    return { valid: false, error: 'precio debe ser un número' };
  }
  if (num < 0) {
    return { valid: false, error: 'precio no puede ser negativo' };
  }
  if (num > 999999) {
    return { valid: false, error: 'precio demasiado alto' };
  }
  return { valid: true };
}

export function validateRating(rating: unknown): { valid: boolean; error?: string } {
  if (typeof rating !== 'number' || !Number.isInteger(rating)) {
    return { valid: false, error: 'rating debe ser un entero entre 1 y 5' };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, error: 'rating debe ser un entero entre 1 y 5' };
  }
  return { valid: true };
}

export function validatePosition(position: unknown): { valid: boolean; error?: string } {
  const pos = Number(position ?? 0);
  if (!Number.isInteger(pos)) {
    return { valid: false, error: 'position debe ser un entero' };
  }
  if (pos < 0) {
    return { valid: false, error: 'position no puede ser negativo' };
  }
  return { valid: true };
}

export function validateUUID(id: string | undefined): { valid: boolean; error?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return { valid: false, error: 'ID inválido' };
  }
  return { valid: true };
}
