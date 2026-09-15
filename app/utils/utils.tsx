export const base64ToFile = (base64: string, fileName: string) => {
  const mimeType = base64.startsWith('data:')
    ? base64.match(/^data:(.*?);base64,/i)?.[1] ?? 'image/png'
    : 'image/png';

  const cleanBase64 = base64.includes(',')
    ? base64.split(',')[1]
    : base64;

  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], fileName, { type: mimeType });
};

export const getRandomOption = (options: string[]) =>
  options.length === 0 ? '' : options[Math.floor(Math.random() * options.length)];

export const getRandomSubset = (options: string[]) => {
  const shuffled = [...options];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const count = Math.floor(Math.random() * (options.length + 1));

  return shuffled.slice(0, count).map((option) => option.trim());
};