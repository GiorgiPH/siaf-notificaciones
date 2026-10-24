import { redirect } from 'next/navigation';
import { HOME_PATH } from '@/core/auth/routes';

export default function RootPage() {
  redirect(HOME_PATH);
}
