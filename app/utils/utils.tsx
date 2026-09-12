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