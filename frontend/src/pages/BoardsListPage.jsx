import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { boardService } from '../api';
import { createBoardSchema } from '../utils/validationSchemas';
import { Button, Input, Modal, ThemeToggle } from '../components';
import './BoardsListPage.css';

const BOARDS_STORAGE_KEY = 'devboard_user_boards';

export const BoardsListPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualId, setManualId] = useState('');

  // Cargar lista de tableros guardados en el cliente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOARDS_STORAGE_KEY);
      if (stored) {
        setBoards(JSON.parse(stored));
      }
    } catch {
      setBoards([]);
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmitCreateBoard = async (values) => {
    try {
      // Petición real al backend: POST /api/boards
      const newBoard = await boardService.createBoard(values);

      // Persistir tablero en el historial local
      const updatedList = [
        {
          _id: newBoard._id,
          name: newBoard.name,
          createdAt: newBoard.createdAt || new Date().toISOString(),
        },
        ...boards.filter((b) => b._id !== newBoard._id),
      ];

      setBoards(updatedList);
      localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(updatedList));

      toast.success('¡Tablero creado con éxito!');
      reset();
      setIsModalOpen(false);

      // Navegación programática POST-mutación exitosa
      navigate(`/boards/${newBoard._id}`);
    } catch (err) {
      const errorMsg = err.data?.error || err.message || 'Error al crear el tablero';
      setError('name', { message: errorMsg });
      toast.error(errorMsg);
    }
  };

  const handleOpenManualId = (e) => {
    e.preventDefault();
    if (!manualId || manualId.trim().length !== 24) {
      toast.error('El ID del tablero debe tener 24 caracteres hexadecimales');
      return;
    }
    navigate(`/boards/${manualId.trim()}`);
  };

  return (
    <div className="boards-page">
      {/* Barra de navegación superior */}
      <nav className="boards-navbar" aria-label="Navegación principal">
        <div className="boards-navbar__inner">
          <div className="boards-navbar__brand">
            <span aria-hidden="true">📋</span>
            <span>DevBoard</span>
          </div>
          <div className="boards-navbar__actions">
            {user && (
              <span className="boards-navbar__user">
                Hola, <strong>{user.name}</strong>
              </span>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="boards-content">
        <header className="boards-header">
          <div>
            <h1 className="boards-header__title">Mis Tableros</h1>
            <p className="boards-header__desc">
              Seleccioná un tablero para ver sus columnas y tickets o creá uno nuevo.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Crear Tablero
            </Button>
          </div>
        </header>

        {/* Buscador directo por ID */}
        <section
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              id="search-board-id"
              label="Abrir tablero por ID directo (24 hex)"
              placeholder="Ej: 6701a2b3c4d5e6f7a8b9c0d1"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
          </div>
          <div style={{ alignSelf: 'flex-end', marginBottom: '0.125rem' }}>
            <Button variant="outline" onClick={handleOpenManualId}>
              Acceder por ID
            </Button>
          </div>
        </section>

        {/* Grilla de tableros */}
        {boards.length > 0 ? (
          <section className="boards-grid" aria-label="Lista de tableros">
            {boards.map((b) => (
              <article
                key={b._id}
                className="board-card"
                onClick={() => navigate(`/boards/${b._id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/boards/${b._id}`)}
              >
                <div>
                  <h2 className="board-card__name">{b.name}</h2>
                  <p className="board-card__meta">ID: {b._id}</p>
                </div>
                <div className="board-card__footer">
                  <span>Abrir Tablero →</span>
                  {b.createdAt && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="boards-empty">
            <span className="boards-empty__icon" aria-hidden="true">🗂️</span>
            <h2 className="boards-empty__title">No tenés tableros activos aún</h2>
            <p className="boards-empty__text">
              Creá tu primer tablero Kanban para organizar tus proyectos en columnas y tickets.
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Crear mi primer tablero
            </Button>
          </section>
        )}
      </main>

      {/* Modal para Crear Tablero */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Tablero"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="create-board-form"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Crear Tablero
            </Button>
          </>
        }
      >
        <form
          id="create-board-form"
          onSubmit={handleSubmit(onSubmitCreateBoard)}
          noValidate
        >
          <Input
            id="board-name"
            label="Nombre del Tablero"
            placeholder="Ej: Sprint 1 — Lanzamiento"
            required
            autoFocus
            error={errors.name?.message}
            helperText="Máximo 100 caracteres según contrato."
            {...register('name')}
          />
        </form>
      </Modal>
    </div>
  );
};

export default BoardsListPage;
