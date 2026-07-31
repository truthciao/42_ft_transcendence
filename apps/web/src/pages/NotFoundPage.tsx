import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main>
      <h1>404</h1>
      <p>The page does not exist.</p>

      <Link to="/">
        Return home
      </Link>
    </main>
  );
}