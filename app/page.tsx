import { redirect } from 'next/navigation';

export default function Home() {
  // Since the app is now fully dependent on the dashboard and admin panel,
  // we redirect the root landing page directly to the login screen.
  redirect('/login');
}
