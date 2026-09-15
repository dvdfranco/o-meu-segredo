import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import useImageGen from '../hooks/useImageGen';
import {
  ActionIcon,
  Button,
  Stack,
  Textarea,
  TagsInput,
  SimpleGrid,
  Paper,
  LoadingOverlay,
  Select,
  Switch,
  Text,
  Box,
  Group,
} from '@mantine/core';
import { IconArrowsShuffle } from '@tabler/icons-react';
import Image from 'next/image';
import {
  IMAGE_GENERATION_PROMPT,
  ITS_A_TRAP_PROMPT,
  RELATED_PROMPT_OPTIONS,
  IMAGE_TYPE_OPTIONS,
  LETTERING_OPTIONS,
  UNWANTED_ELEMENTS_HEADER,
  UNWANTED_ELEMENTS,
} from '../api/constants';
import { getRandomOption, getRandomSubset } from '../utils/utils';

const buildPrompt = (
  description: string,
  related: string,
  imageType: string,
  lettering: string,
  unwantedElements: string[],
  useTrapWarning: boolean
) => {
  const trapWarning = useTrapWarning ? ITS_A_TRAP_PROMPT : '';
  const unwantedElementsPrompt = unwantedElements.length > 0
    ? `${UNWANTED_ELEMENTS_HEADER}${unwantedElements.map((el) => el.trim().startsWith('-') ? `  ${el}` : `  - ${el}`).join('\n')}\n`
    : '';

  return (IMAGE_GENERATION_PROMPT ?? '')
    .replace('{DESCRIPTION}', description)
    .replace('{RELATED}', related)
    .replace('{IMAGE_TYPE}', imageType)
    .replace('{LETTERING}', lettering)
    .replace('- {UNWANTED_ELEMENTS}\n', unwantedElementsPrompt)
    .replace('{UNWANTED_ELEMENTS}', unwantedElementsPrompt)
    .replace('{TRAP_WARNING}', trapWarning);
};

interface GenerateImageFormProps {
  fromDescription: string;
  onImageGenerated: (imageBase64: string | null) => void;
}
export default function GenerateImageForm({ fromDescription, onImageGenerated }: GenerateImageFormProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [includeTrapWarning, setIncludeTrapWarning] = useState(false);
  const [selectedRelated, setSelectedRelated] = useState(getRandomOption(RELATED_PROMPT_OPTIONS));
  const [selectedImageType, setSelectedImageType] = useState(getRandomOption(IMAGE_TYPE_OPTIONS));
  const [selectedLettering, setSelectedLettering] = useState(getRandomOption(LETTERING_OPTIONS));
  const [selectedUnwantedElements, setSelectedUnwantedElements] = useState(getRandomSubset(UNWANTED_ELEMENTS));
  const { generateImage, isLoading } = useImageGen();

  const relatedData = RELATED_PROMPT_OPTIONS.map((option) => ({ value: option, label: option }));
  const imageTypeData = IMAGE_TYPE_OPTIONS.map((option) => ({ value: option, label: option }));
  const letteringData = LETTERING_OPTIONS.map((option) => ({ value: option, label: option }));
  const unwantedElementsData = UNWANTED_ELEMENTS.map((option) => option.trim());

  const defaultValues = {
    prompt: buildPrompt(
      fromDescription,
      RELATED_PROMPT_OPTIONS[0],
      IMAGE_TYPE_OPTIONS[0],
      LETTERING_OPTIONS[0],
      [],
      false
    ),
  };
  const { getValues, register, formState, setValue } = useForm<{ prompt: string }>({ defaultValues });

  useEffect(() => {
    const nextPrompt = buildPrompt(
      fromDescription,
      selectedRelated,
      selectedImageType,
      selectedLettering,
      selectedUnwantedElements,
      includeTrapWarning
    );

    setValue('prompt', nextPrompt, { shouldValidate: true });
  }, [fromDescription, selectedRelated, selectedImageType, selectedLettering, selectedUnwantedElements, includeTrapWarning, setValue, buildPrompt]);

  const randomizeSelections = () => {
    setSelectedRelated(getRandomOption(RELATED_PROMPT_OPTIONS));
    setSelectedImageType(getRandomOption(IMAGE_TYPE_OPTIONS));
    setSelectedLettering(getRandomOption(LETTERING_OPTIONS));
    setSelectedUnwantedElements(getRandomSubset(UNWANTED_ELEMENTS));
  };

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
    onImageGenerated(image.imageBase64);
    setErrorMessage(null);
  };

  return (
    <Box>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
          <Paper p={{ base: 'md', sm: 'lg' }} radius="md" withBorder style={{ minWidth: 0 }}>
            <Stack gap="md">
              <Text fw={600}>Gerar uma nova imagem:</Text>

              <Group gap="xs" align="end" wrap="nowrap">
                <Switch
                  label="Incluir ITS_A_TRAP"
                  checked={includeTrapWarning}
                  onChange={(event) => setIncludeTrapWarning(event.currentTarget.checked)}
                  style={{ flex: 1 }}
                />

                <ActionIcon
                  variant="light"
                  size="lg"
                  aria-label="Randomizar opções"
                  onClick={randomizeSelections}
                >
                  <IconArrowsShuffle size={18} />
                </ActionIcon>
              </Group>

              <Select
                label="Semelhança com o texto"
                data={relatedData}
                value={selectedRelated}
                onChange={(value) => {
                  if (value) {
                    setSelectedRelated(value);
                  }
                }}
                searchable
                nothingFoundMessage="Sem opções"
              />

              <Select
                label="Estilo de imagem"
                data={imageTypeData}
                value={selectedImageType}
                onChange={(value) => {
                  if (value) {
                    setSelectedImageType(value);
                  }
                }}
                searchable
                nothingFoundMessage="Sem opções"
              />

              <Select
                label="Estilo de texto"
                data={letteringData}
                value={selectedLettering}
                onChange={(value) => {
                  if (value) {
                    setSelectedLettering(value);
                  }
                }}
                searchable
                nothingFoundMessage="Sem opções"
              />

              <TagsInput
                label="Elementos indesejados"
                placeholder="Escreva..."
                data={unwantedElementsData}
                value={selectedUnwantedElements}
                onChange={setSelectedUnwantedElements}
                clearable
              />

              <Textarea
                label="Prompt"
                placeholder="Prompt para geração"
                autosize
                minRows={4}
                maxRows={8}
                aria-label="Prompt"
                {...register('prompt', {
                  required: 'Digite algo.',
                  validate: (value) => value.trim().length > 0 || 'Digite algo.',
                })}
                error={formState.errors.prompt?.message}
              />

              <Button type="button" onClick={handleGenerateNewImage} fullWidth>
                Gerar
              </Button>
            </Stack>
          </Paper>

          <Paper p={{ base: 'md', sm: 'lg' }} radius="md" withBorder style={{ minWidth: 0, position: 'relative' }}>
            <Stack gap="md" align="center">
              <LoadingOverlay visible={isLoading} />
              {currentImage && (
                <Box style={{ width: '100%', maxWidth: 520 }}>
                  <Image
                    src={`data:image/png;base64,${currentImage}`}
                    alt="Generated image"
                    width={1200}
                    height={900}
                    sizes="(max-width: 48em) 100vw, 45vw"
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                </Box>
              )}
              {errorMessage && <Text c="red">{errorMessage}</Text>}
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}