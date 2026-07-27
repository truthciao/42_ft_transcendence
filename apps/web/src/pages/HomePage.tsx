import { Link } from 'react-router';

export function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Home
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome to ft_transcendence.
      </p>

      <Link
        to="/profile"
        className="mt-4 inline-block text-blue-600 hover:underline"
      >
        View your profile
      </Link>
    </main>
  );
}