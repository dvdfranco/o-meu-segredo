'use client';

import { Group, Loader, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useState } from 'react';
import useUpload from '@/app/hooks/useUpload';
import '@mantine/dropzone/styles.css';

type UploadSecretProps = {
  onUploaded: (url: string) => void;
};

export default function UploadSecret({ onUploaded }: UploadSecretProps) {
  const { uploadFile } = useUpload();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Dropzone
        onDrop={(files) => {
          const file = files[0];
          if (file) {
            setUploading(true);
            uploadFile(file)
              .then(onUploaded)
              .catch((uploadError) => {
                setError(
                  uploadError instanceof Error
                    ? uploadError.message
                    : 'Não foi possível enviar a imagem.',
                );
              })
              .finally(() => {
                setUploading(false);
              });
          }
        }}
        maxSize={10 * 1024 ** 2}
        maxFiles={1}
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        disabled={uploading}
      >
        <Group justify="center" gap="sm">
          <Text size="sm" c="dimmed">
            {uploading ? (
              <Loader size="sm" />
            ) : (
              <span>Arraste aqui ou clique para escolher uma imagem</span>
            )}
          </Text>
        </Group>
      </Dropzone>

      {error && (
        <Text size="sm" c="red" mt="xs">
          {error}
        </Text>
      )}
    </div>
  );
}
