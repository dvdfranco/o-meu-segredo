import SecretList from './components/SecretList';
import AddSecret from './components/AddSecret';

export default function HomePage() {
  return (
    <>
      <AddSecret />
      <SecretList />
    </>
  );
}
