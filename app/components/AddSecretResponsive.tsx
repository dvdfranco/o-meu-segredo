'use client';

import { Button, Collapse, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronUp,
  IconMessageCircleHeart,
} from '@tabler/icons-react';
import AddSecret from '@/app/components/AddSecret';

export default function AddSecretResponsive() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [opened, { toggle }] = useDisclosure(false);

  if (!isMobile) return <AddSecret />;
  return (
    <section className="add-secret-mobile" aria-label="Enviar segredo">
      <Stack gap="sm">
        <Button
          fullWidth
          radius="xl"
          size="md"
          variant="filled"
          className="add-secret-mobile__toggle"
          onClick={toggle}
          leftSection={<IconMessageCircleHeart size={18} />}
          rightSection={opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          aria-expanded={opened}
          aria-controls="add-secret-mobile-collapse"
        >
          Envie o seu Segredo
        </Button>

        <Collapse expanded={opened} transitionDuration={280} transitionTimingFunction="ease">
          <Paper
            id="add-secret-mobile-collapse"
            withBorder
            radius="md"
            p={0}
            className="add-secret-mobile__panel"
          >
            <AddSecret />
          </Paper>
        </Collapse>

        {!opened && (
          <Text size="xs" c="dimmed" ta="center">
            Compartilhe anonimamente quando estiver pronto.
          </Text>
        )}
      </Stack>
    </section>
  );
}
