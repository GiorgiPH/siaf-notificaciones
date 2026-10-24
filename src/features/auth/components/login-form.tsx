'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { Button } from '@/core/components/ui/button';
import { Field } from '@/core/components/ui/field';
import { Input } from '@/core/components/ui/input';
import { PasswordInput } from '@/core/components/ui/password-input';
import { loginAction, type LoginState } from '../actions';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const callbackUrl = useSearchParams().get('callbackUrl') ?? '';

  return (
    <form action={formAction} className="flex w-full flex-col gap-4" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.error && <AlertBanner variant="error">{state.error}</AlertBanner>}

      <Field label="Usuario" htmlFor="usuario" error={state.fieldErrors?.usuario}>
        <Input
          id="usuario"
          name="usuario"
          autoComplete="username"
          maxLength={24}
          defaultValue={state.usuario}
          required
          autoFocus
        />
      </Field>

      <Field label="Contraseña" htmlFor="password" error={state.fieldErrors?.password}>
        <PasswordInput id="password" name="password" autoComplete="current-password" maxLength={128} required />
      </Field>

      <Button type="submit" size="lg" className="mx-auto mt-2 px-10" disabled={isPending}>
        {isPending ? 'Entrando…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
