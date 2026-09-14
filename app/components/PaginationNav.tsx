'use client';

import { Pagination } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';

type PaginationNavProps = {
  currentPage: number;
  pageCount: number;
};

export default function PaginationNav({
  currentPage,
  pageCount,
}: PaginationNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (pageCount <= 1) return null;

  const getPageHref = (page: number) =>
    page === 1 ? pathname : `${pathname}?page=${page}`;

  return (
    <nav className="pagination" aria-label="Navegação dos segredos">
      <Pagination
        total={pageCount}
        value={currentPage}
        onChange={(page) => router.push(getPageHref(page))}
        getItemProps={(page) => ({
          component: 'a',
          href: getPageHref(page),
          'aria-label': `Ir para a página ${page}`,
        })}
      />
    </nav>
  );
}
