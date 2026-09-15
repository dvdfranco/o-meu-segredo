'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Box, Button, Group, Image, LoadingOverlay, Modal, Pagination, Switch, Table, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import './SecretListAdmin.scss';
import useSecrets from '../hooks/useSecrets';
import { IconTrash, IconPhoto } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { Lightbox } from '@mantine/lightbox';
import GenerateImageForm from './GenerateImageForm';
import useUpload from '../hooks/useUpload';
import { base64ToFile } from '../utils/utils';

export default function SecretsTable() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activePage, setActivePage] = useState(1);
  const pageSize = 50;

  const { secrets, total, isLoading, loadingUpdate, hasError, setPublished, deleteSecret, updateImage } = useSecrets(false, activePage, pageSize);
  const pageCount = Math.ceil(total / pageSize);

  const [newImageCreated, setNewImageCreated] = useState<string | null>(null);
  const [isGenerateImageModalOpen, setIsGenerateImageModalOpen] = useState(false);
  const [selectedSecretId, setSelectedSecretId] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState('');
  const { uploadFile, deleteFile, isLoading: isUploading } = useUpload();

  const handleDelete = async (id: number) => {
    const shouldGoToPreviousPage = secrets.length === 1 && activePage > 1;

    if (shouldGoToPreviousPage) {
      setActivePage((previousPage) => previousPage - 1);
    }

    const imageUrl = secrets.find(secret => secret.id === id)?.image_url ?? '';

    await deleteSecret(id);

    try {
      await deleteFile(imageUrl);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  const closeGenerateImageModal = () => {
    setIsGenerateImageModalOpen(false);
    setSelectedSecretId(null);
    setSelectedDescription('');
    setNewImageCreated(null);
  };

  const handleSaveImage = async () => {
    if (selectedSecretId === null || !newImageCreated)
      return;

    const file = base64ToFile(newImageCreated, 'new-image.jpg');
    const url = await uploadFile(file, '/');
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    await updateImage(selectedSecretId, fileName);
    closeGenerateImageModal();
  };

  const openDeleteModal = (id: number) =>
    modals.openConfirmModal({
      title: 'Excluir segredo',
      centered: true,
      children: (
        <Text size="sm">Tem certeza que deseja excluir este registro?</Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('c'),
      onConfirm: () => handleDelete(id),
    });

  const openGenerateImageModal = (secretId: number, description: string) =>
    {
      setSelectedSecretId(secretId);
      setSelectedDescription(description);
      setNewImageCreated(null);
      setIsGenerateImageModalOpen(true);
    };

  if (hasError)
    return (
      <p className="state error">
        Não foi possível carregar os últimos segredos.
      </p>
    );
  if (secrets.length === 0)
    return <p className="state">Ainda não há segredos.</p>;

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isLoading || loadingUpdate || isUploading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Table.ScrollContainer minWidth={720} type="native">
        <Table
          className="secret-list-admin-table"
          withTableBorder
          highlightOnHover
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Data</Table.Th>
              <Table.Th>Descrição</Table.Th>
              <Table.Th>Imagem</Table.Th>
              <Table.Th>Publicar</Table.Th>
              <Table.Th>Opções</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {secrets.map((secret) => (
              <Table.Tr key={secret.id}>
                <Table.Td>{format(new Date(secret.created_at), 'dd/MM/yyyy')}</Table.Td>
                <Table.Td>{secret.description}</Table.Td>
                <Table.Td>
                  {secret.image_url && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_BUCKET_URL}/${secret.image_url}`}
                      onClick={(event) => {
                        event.preventDefault();
                        Lightbox.open({
                          slides: [
                            { src: `${process.env.NEXT_PUBLIC_BUCKET_URL}/${secret.image_url}`, alt: 'Imagem do segredo' },
                          ],
                        });
                      }}
                    >
                      <Image src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/${secret.image_url}`} alt="Imagem do segredo" className="secret-card__thumb" />
                    </a>
                  )}
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={secret.is_published}
                    onChange={(event) =>
                      setPublished(secret.id, event.currentTarget.checked)
                    }
                  />
                </Table.Td>
                <Table.Td className="secret-list-admin-table__options">
                  <Button
                    color="red"
                    onClick={() => openDeleteModal(secret.id)}
                  >
                    <IconTrash size={16} />
                  </Button>

                  <Button
                    onClick={() => openGenerateImageModal(secret.id, secret.description)}
                  >
                    <IconPhoto size={16} />
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {pageCount > 1 && (
        <Pagination
          className="secret-list-admin-pagination"
          total={pageCount}
          value={activePage}
          onChange={setActivePage}
        />
      )}
      <Modal
        opened={isGenerateImageModalOpen}
        onClose={closeGenerateImageModal}
        title="Gerar imagem"
        centered={!isMobile}
        fullScreen={!!isMobile}
      >
        <GenerateImageForm
          fromDescription={selectedDescription}
          onImageGenerated={(val: string | null) => setNewImageCreated(val)}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeGenerateImageModal}>Cancelar</Button>
          <Button color="blue" onClick={handleSaveImage} disabled={!newImageCreated}>Salvar</Button>
        </Group>
      </Modal>
      <Lightbox.Provider />
    </Box>
  );
}
