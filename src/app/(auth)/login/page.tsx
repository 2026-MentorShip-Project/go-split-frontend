import LoginClient from './LoginClient';

export default function LoginPage() {
  return <LoginClient googleClientId={process.env.GOOGLE_CLIENT_ID!} />;
}
