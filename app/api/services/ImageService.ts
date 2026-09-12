import { GoogleGenAI } from '@google/genai';

class ImageService {
  static async generateSecretImage(fromText: string): Promise<string> {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY ?? '',
    });

    const prompt = `Create a random illustration containing this text: ${fromText}.`;

    const interaction = await ai.interactions.create({
      model: 'gemini-3.1-flash-lite-image',
      input: prompt,
    });

    const generatedImage = interaction.output_image;

    if (!generatedImage?.data) {
      throw new Error('A API de imagem não retornou uma imagem.');
    }

    return generatedImage.data;
  }
}

export default ImageService;