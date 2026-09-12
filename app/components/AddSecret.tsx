'use client';

import {
  Alert,
  Button,
  Group,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconInfoCircle,
  IconPencil,
  IconPhotoUp,
  IconShieldLock,
} from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import UploadSecret from '@/app/components/UploadSecret';
import useSecrets from '@/app/hooks/useSecrets';

type AddSecretFormValues = {
  description: string;
  imageUrl?: string;
};

export default function AddSecret() {
  const { addSecret } = useSecrets();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<AddSecretFormValues>({
    defaultValues: { description: '' },
    mode: 'onChange',
  });

  const description = form.watch('description') ?? '';

  const onSubmit = async (values: AddSecretFormValues) => {
    try {
      const imageUrl = values.imageUrl
        ? values.imageUrl.substring(values.imageUrl.lastIndexOf('/') + 1)
        : undefined;

      setSubmitted(false);
      await addSecret(values.description, imageUrl);
      form.reset();
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o segredo.';

      form.setError('description', { type: 'manual', message });
    }
  };

  const handleUploadSecret = async (url: string) => {
    await onSubmit({
      description: '',
      imageUrl: url,
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        padding: '0 1.5rem',
        marginBottom: '3rem',
      }}
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" verticalSpacing="md">
          <Paper p="lg" radius="md" withBorder style={{ flex: 1, minWidth: 0 }}>
            <Stack gap="md">
              <div>
                <Group gap="sm" align="center">
                  <ThemeIcon size="lg" radius="xl" variant="light" color="blue">
                    <IconPencil size={18} />
                  </ThemeIcon>
                  <Title order={4}>Escreva seu segredo...</Title>
                </Group>

                <Text size="sm" c="dimmed" mt={8}>
                  Compartilhe em texto e nossa curadoria transforma em uma
                  imagem inspiradora.
                </Text>
              </div>

              <Textarea
                label="Meu segredo"
                placeholder="Escreva aqui o seu segredo..."
                autosize
                minRows={3}
                maxLength={140}
                aria-label="Meu segredo"
                {...form.register('description', {
                  required: 'Digite algo.',
                  validate: (value) =>
                    value.trim().length > 0 || 'Digite algo.',
                  maxLength: {
                    value: 140,
                    message: 'Máximo de 140 caracteres.',
                  },
                })}
                error={form.formState.errors.description?.message}
              />

              <Group justify="space-between" mt="xs">
                <Text size="xs" c="dimmed">
                  {description.length}/140
                </Text>

                <Button
                  type="submit"
                  loading={form.formState.isSubmitting}
                  disabled={form.formState.isSubmitting}
                >
                  Enviar
                </Button>
              </Group>
            </Stack>
          </Paper>

          <Paper p="lg" radius="md" withBorder style={{ flex: 1, minWidth: 0 }}>
            <Stack gap="md">
              <div>
                <Group gap="sm" align="center">
                  <ThemeIcon
                    size="lg"
                    radius="xl"
                    variant="light"
                    color="grape"
                  >
                    <IconPhotoUp size={18} />
                  </ThemeIcon>
                  <Title order={4}>...ou envie a sua própria arte</Title>
                </Group>

                <Text size="sm" c="dimmed" mt={8}>
                  Você pode enviar sua própria imagem contendo o seu segredo
                  escrito.
                </Text>
              </div>

              <UploadSecret onUploaded={handleUploadSecret} />

              <Text size="xs" c="dimmed">
                Imagens de até 10 MB nos formatos JPG e PNG.
              </Text>
            </Stack>
          </Paper>

          <Paper p="lg" radius="md" withBorder style={{ flex: 1, minWidth: 0 }}>
            <Stack gap="sm">
              <Group gap="sm" align="center">
                <ThemeIcon size="lg" radius="xl" variant="light" color="blue">
                  <IconInfoCircle size={18} />
                </ThemeIcon>
                <Title order={4}>Como funciona</Title>
              </Group>

              <Text size="sm">
                Seu segredo será anônimo e mantido em sigilo. Nenhum dado pessoal
                será armazenado.
              </Text>
              <Text size="sm">
                Após análise e curadoria, transformaremos seu texto em uma imagem
                inspiradora para publicação (a não ser que você tenha enviado sua
                própria arte).
              </Text>
              <List
                size="sm"
                spacing="xs"
                icon={
                  <ThemeIcon size={20} radius="xl" variant="light" color="blue">
                    <IconShieldLock size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  Utilize frases curtas e sucintas. Evite uma longa história.
                </List.Item>
                <List.Item>
                  <strong>Não mencione</strong> nomes nem dados que identifiquem
                  você ou outra pessoa.
                </List.Item>
                <List.Item>
                  <strong>Evite</strong> linguagem imprópria.
                </List.Item>
                <List.Item>
                  <strong>Não compartilhe</strong> informações confidenciais.
                </List.Item>
              </List>
            </Stack>
          </Paper>
        </SimpleGrid>

        {submitted && (
          <Alert
            color="green"
            variant="light"
            radius="md"
            title="Segredo enviado com sucesso"
            icon={<IconCircleCheck size={18} />}
          >
            <Text size="sm">
              Obrigado por compartilhar. Seu segredo passará por curadoria e, se
              estiver de acordo com as regras, será publicado em breve.
            </Text>
          </Alert>
        )}
      </Stack>
    </form>
  );
}
