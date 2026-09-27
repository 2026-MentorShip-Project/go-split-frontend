import { Suspense } from "react";
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient googleClientId={process.env.GOOGLE_CLIENT_ID!} />
    </Suspense>
  );
}
