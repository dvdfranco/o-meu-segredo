'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Box, Button, Image, LoadingOverlay, Pagination, Switch, Table, Text } from '@mantine/core';
import './SecretListAdmin.scss';
import useSecrets from '../hooks/useSecrets';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { Lightbox } from '@mantine/lightbox';

export default function SecretsTable() {
  const [activePage, setActivePage] = useState(1);
  const pageSize = 50;
  const { secrets, total, isLoading, loadingUpdate, hasError, setPublished, deleteSecret } = useSecrets(false, activePage, pageSize);
  const pageCount = Math.ceil(total / pageSize);

  const handleDelete = (id: number) => {

        const shouldGoToPreviousPage = secrets.length === 1 && activePage > 1;

        if (shouldGoToPreviousPage) {
          setActivePage((previousPage) => previousPage - 1);
        }

        deleteSecret(id);  }

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
      <LoadingOverlay visible={isLoading || loadingUpdate} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Table
        className="secret-list-admin-table"
        withTableBorder
        // withColumnBorders
        // striped
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
                    href={secret.image_url}
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
              <Table.Td>
                <Button
                  color="red"
                  onClick={() => openDeleteModal(secret.id)}
                >
                  <IconTrash size={16} />
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {pageCount > 1 && (
        <Pagination
          className="secret-list-admin-pagination"
          total={pageCount}
          value={activePage}
          onChange={setActivePage}
        />
      )}
      <Lightbox.Provider />
    </Box>
  );
}
