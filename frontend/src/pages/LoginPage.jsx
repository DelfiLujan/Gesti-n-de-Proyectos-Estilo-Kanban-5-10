import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/validationSchemas';
import { Button, Input, ThemeToggle } from '../components';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Si ya tiene sesión, redirigir directo a /boards
  if (isAuthenticated) {
    return <Navigate to="/boards" replace />;
  }

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success('¡Bienvenido a DevBoard!');
      navigate('/boards');
    } catch (err) {
      const msg = err.data?.error || err.message || 'Error al iniciar sesión';
      setError('root', { message: msg });
      toast.error(msg);
    }
  };

  return (
    <main className="login-page">
      <div className="login-header-nav">
        <ThemeToggle />
      </div>

      <div className="login-card">
        <header className="login-card__header">
          <span className="login-card__icon" aria-hidden="true">📋</span>
          <h1 className="login-card__title">DevBoard</h1>
          <p className="login-card__subtitle">
            Ingresá a tu espacio de trabajo Kanban
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="login-card__form" noValidate>
          {errors.root && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--danger-surface)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          <Input
            id="login-email"
            label="Correo Electrónico"
            type="email"
            placeholder="desarrollador@devboard.com"
            required
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="login-password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Iniciar Sesión
          </Button>

          <aside className="login-card__hint">
            <strong>💡 Acceso de demostración:</strong> Podés ingresar cualquier correo válido y contraseña para ingresar (ej. <code>demo@devboard.com</code> / <code>123456</code>).
          </aside>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
