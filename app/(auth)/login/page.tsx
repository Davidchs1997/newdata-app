'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push('/upload');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Iniciar sesión</button>
      </form>

      <button onClick={() => signIn('google')}>Iniciar sesión con Google</button>
      <p>
        ¿No tienes cuenta? <a href="/register">Regístrate</a>
      </p>
    </div>
  );
}
