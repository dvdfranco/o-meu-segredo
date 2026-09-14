import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SecretList from './components/SecretList';
import AddSecretResponsive from './components/AddSecretResponsive';
import SecretService from './api/services/SecretService';
import PaginationNav from './components/PaginationNav';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 30;

type HomePageProps = {
  searchParams: Promise<{ page?: string }>;
};

function getPageNumber(value: string | undefined, pageCount: number) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, pageCount || 1);
}

function getCanonicalPath(page: number) {
  return page === 1 ? '/' : `/?page=${page}`;
}

// True when the raw ?page value doesn't exactly match a valid, non-default page number
function isNonCanonicalPage(value: string | undefined, currentPage: number) {
  if (value === undefined) return false;
  return value !== String(currentPage) || currentPage === 1;
}

// This is mostly for google indexing, twitter sharing, etc:
export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const { page: requestedPage } = await searchParams;
  const { total } = await SecretService.listSecrets(true, 1, PAGE_SIZE);
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const currentPage = getPageNumber(requestedPage, pageCount);

  return {
    alternates: { canonical: getCanonicalPath(currentPage) },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page: requestedPage } = await searchParams;
  const firstPageResult = await SecretService.listSecrets(true, 1, PAGE_SIZE);
  const pageCount = Math.ceil(firstPageResult.total / PAGE_SIZE);
  const currentPage = getPageNumber(requestedPage, pageCount);

  if (isNonCanonicalPage(requestedPage, currentPage)) {
    redirect(getCanonicalPath(currentPage));
  }

  const { secrets, total } = currentPage === 1
    ? firstPageResult
    : await SecretService.listSecrets(true, currentPage, PAGE_SIZE);

  return (
    <>
      <AddSecretResponsive />
      <SecretList
        page={currentPage}
        pageSize={PAGE_SIZE}
        initialSecrets={secrets}
        initialTotal={total}
      />
      <PaginationNav currentPage={currentPage} pageCount={pageCount} />
    </>
  );
}
