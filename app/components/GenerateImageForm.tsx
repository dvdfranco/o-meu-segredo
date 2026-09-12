import { useForm } from 'react-hook-form';
import { useState } from 'react';
import useImageGen from '../hooks/useImageGen';
import { Button, Stack, Textarea, SimpleGrid, Paper, LoadingOverlay } from '@mantine/core';
import Image from 'next/image';
import { Text } from '@mantine/core';
import { IMAGE_GENERATION_PROMPT } from '../api/constants';

interface GenerateImageFormProps {
  fromDescription: string;
  onImageGenerated: (imageBase64: string | null) => void;
}
export default function GenerateImageForm({ fromDescription, onImageGenerated }: GenerateImageFormProps) {

  const [currentImage, setCurrentImage] = useState<string|null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { generateImage, isLoading } = useImageGen();

  const defaultValues = {
    prompt: (IMAGE_GENERATION_PROMPT ?? '').replace('{0}', fromDescription)
  };
  const { getValues, control, register, formState } = useForm<{ prompt: string }>({ defaultValues });

  const handleGenerateNewImage = async () => {
    const prompt = getValues('prompt');
    const image = await generateImage(prompt);

    if (!image || !image.ok) {
      setCurrentImage(null);
      setErrorMessage(image?.error ?? '');
      onImageGenerated(null);
      return;
    }

    setCurrentImage(image.imageBase64);
    console.log("chaamremos onImageGenerated");
    onImageGenerated(image.imageBase64);
    setErrorMessage(null);
  };

  return (
    <div>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
          <Paper p="lg" radius="md" withBorder style={{ flex: 1, minWidth: 0 }}>
            <Stack gap="md">
              <p>Gerar uma nova imagem:</p>

              <Textarea
                  label="Prompt"
                  placeholder="Prompt para geração"
                  autosize
                  minRows={3}
                  maxRows={8}
                  aria-label="Prompt"
                  {...register('prompt', {
                      required: 'Digite algo.',
                      validate: (value) =>
                      value.trim().length > 0 || 'Digite algo.',
                  })}
                  error={formState.errors.prompt?.message}
              />

              <Button
                type="button"
                onClick={handleGenerateNewImage}
              >
                Gerar
              </Button>
            </Stack>
          </Paper>

          <Paper p="lg" radius="md" withBorder style={{ flex: 1, minWidth: 0 }}>
            <Stack gap="md">
                <LoadingOverlay visible={isLoading} />
                {currentImage && <Image src={`data:image/png;base64,${currentImage}`} alt="Generated image" width={350} height={300} />}
                {errorMessage && <Text style={{ color: 'red' }}>{errorMessage}</Text>}
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    </div>
  );
}