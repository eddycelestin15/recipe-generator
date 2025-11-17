import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard (proxy.ts also handles this, but this ensures explicit routing)
  redirect('/dashboard');
}
