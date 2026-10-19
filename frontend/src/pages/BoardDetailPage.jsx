import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { boardService, columnService, ticketService } from '../api';
import { createColumnSchema, createTicketSchema } from '../utils/validationSchemas';
import {
  Button,
  Input,
  Modal,
  Spinner,
  ThemeToggle,
  TicketCard,
  ColumnHeader,
} from '../components';
import './BoardDetailPage.css';

export const BoardDetailPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados de modales
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // 1. Consulta del tablero por ID con React Query
  const {
    data: board,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoardById(boardId),
    enabled: Boolean(boardId),
    retry: 1,
  });

  // 2. Mutación optimista para mover tickets (PASO 6)
  const moveTicketMutation = useMutation({
    mutationFn: ({ originColumnId, ticketId, destColumnId, position }) =>
      ticketService.updateTicket(boardId, originColumnId, ticketId, {
        columnId: destColumnId,
        position,
      }),
    onMutate: async ({ originColumnId, ticketId, destColumnId, position }) => {
      // Cancelar refetches en curso sobre este tablero
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });

      // Tomar snapshot del estado anterior
      const previousBoard = queryClient.getQueryData(['board', boardId]);

      if (previousBoard && previousBoard.columns) {
        // Encontrar el ticket que se mueve
        let movingTicket = null;
        for (const col of previousBoard.columns) {
          if (col._id === originColumnId && col.tickets) {
            movingTicket = col.tickets.find((t) => t._id === ticketId);
            break;
          }
        }

        if (movingTicket) {
          // Clonar y reestructurar optimistamente las columnas
          const updatedTicket = {
            ...movingTicket,
            column: destColumnId,
            position: position ?? 0,
          };

          const optimisticColumns = previousBoard.columns.map((col) => {
            if (col._id === originColumnId) {
              return {
                ...col,
                tickets: (col.tickets || []).filter((t) => t._id !== ticketId),
              };
            }
            if (col._id === destColumnId) {
              return {
                ...col,
                tickets: [...(col.tickets || []), updatedTicket].sort(
                  (a, b) => (a.position || 0) - (b.position || 0)
                ),
              };
            }
            return col;
          });

          // Actualizar caché de TanStack Query
          queryClient.setQueryData(['board', boardId], {
            ...previousBoard,
            columns: optimisticColumns,
          });
        }
      }

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      // Rollback al snapshot previo
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', boardId], context.previousBoard);
      }
      const msg = err.data?.error || err.message || 'Error al mover el ticket';
      toast.error(`Reversión: ${msg}`);
    },
    onSuccess: () => {
      toast.success('Ticket movido correctamente');
    },
    onSettled: () => {
      // Sincronización definitiva con la DB
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  // 3. Mutación para Crear Columna (Estándar)
  const createColumnMutation = useMutation({
    mutationFn: (values) => columnService.createColumn(boardId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('Columna creada con éxito');
      setIsColumnModalOpen(false);
      resetColumnForm();
    },
    onError: (err) => {
      const msg = err.data?.error || err.message || 'Error al crear columna';
      toast.error(msg);
    },
  });

  // 4. Mutación para Crear Ticket (Estándar)
  const createTicketMutation = useMutation({
    mutationFn: (values) => ticketService.createTicket(boardId, activeColumnId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('Ticket creado con éxito');
      setIsTicketModalOpen(false);
      resetTicketForm();
    },
    onError: (err) => {
      const msg = err.data?.error || err.message || 'Error al crear ticket';
      toast.error(msg);
    },
  });

  // 5. Mutación para Eliminar Columna (Cascada)
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId) => columnService.deleteColumn(boardId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('Columna y tickets eliminados');
    },
    onError: (err) => {
      const msg = err.data?.error || err.message || 'Error al eliminar columna';
      toast.error(msg);
    },
  });

  // Formularios con React Hook Form + Zod
  const {
    register: registerColumn,
    handleSubmit: handleSubmitColumn,
    reset: resetColumnForm,
    formState: { errors: columnErrors, isSubmitting: isSubmittingColumn },
  } = useForm({
    resolver: zodResolver(createColumnSchema),
    defaultValues: { name: '', order: 0 },
  });

  const {
    register: registerTicket,
    handleSubmit: handleSubmitTicket,
    reset: resetTicketForm,
    formState: { errors: ticketErrors, isSubmitting: isSubmittingTicket },
  } = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { title: '', description: '', position: 0 },
  });

  // Drag & Drop Handlers
  const handleDragStart = (e, ticket, originColId) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ ticketId: ticket._id, originColumnId: originColId })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverColumnId(null);
  };

  const handleDrop = (e, destColumnId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    try {
      const { ticketId, originColumnId } = JSON.parse(rawData);
      if (!ticketId || !originColumnId || originColumnId === destColumnId) {
        return;
      }

      // Aplicar mutación optimista
      moveTicketMutation.mutate({
        originColumnId,
        ticketId,
        destColumnId,
        position: 0,
      });
    } catch {
      // Ignorar datos no parseables
    }
  };

  const handleTicketDeleteNotice = (ticket) => {
    toast(
      `El backend no posee endpoint para borrar tickets individuales (${ticket.title}). Solo se eliminan en cascada con su columna.`,
      { icon: 'ℹ️', duration: 4000 }
    );
  };

  // Estado: Cargando
  if (isLoading) {
    return (
      <div className="board-detail-page">
        <div className="board-state-view">
          <Spinner size="lg" />
          <h2 className="board-state-view__title">Cargando tablero...</h2>
          <p className="board-state-view__desc">Conectando con la API del backend</p>
        </div>
      </div>
    );
  }

  // Estado: Error (404, 400, 500)
  if (isError) {
    const errorMsg = error?.data?.error || error?.message || 'No se pudo cargar el tablero';
    return (
      <div className="board-detail-page">
        <div className="board-state-view">
          <span style={{ fontSize: '3rem' }} aria-hidden="true">⚠️</span>
          <h2 className="board-state-view__title">Error al cargar el tablero</h2>
          <p className="board-state-view__desc">{errorMsg}</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => navigate('/boards')}>
              ← Volver a Mis Tableros
            </Button>
            <Button variant="primary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const columns = board?.columns || [];

  return (
    <div className="board-detail-page">
      {/* Barra de navegación del tablero */}
      <nav className="board-navbar" aria-label="Navegación del tablero">
        <div className="board-navbar__inner">
          <div className="board-navbar__left">
            <Button variant="ghost" size="sm" onClick={() => navigate('/boards')}>
              ← Tableros
            </Button>
            <h1 className="board-navbar__title">
              <span aria-hidden="true">📋</span>
              <span>{board.name}</span>
            </h1>
          </div>
          <div className="board-navbar__right">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsColumnModalOpen(true)}
            >
              + Nueva Columna
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Tablero Kanban */}
      <main className="board-main-container">
        {columns.length > 0 ? (
          <div className="kanban-board">
            {columns.map((col) => {
              const tickets = col.tickets || [];
              const isOver = dragOverColumnId === col._id;

              return (
                <section
                  key={col._id}
                  className={`kanban-column ${isOver ? 'kanban-column--drag-over' : ''}`.trim()}
                  onDragOver={(e) => handleDragOver(e, col._id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col._id)}
                  aria-label={`Columna ${col.name}`}
                >
                  <ColumnHeader
                    name={col.name}
                    count={tickets.length}
                    onAddTicket={() => {
                      setActiveColumnId(col._id);
                      setIsTicketModalOpen(true);
                    }}
                    onDelete={() => {
                      if (window.confirm(`¿Seguro que deseás eliminar la columna "${col.name}" y sus tickets en cascada?`)) {
                        deleteColumnMutation.mutate(col._id);
                      }
                    }}
                  />

                  <div className="kanban-column__tickets">
                    {tickets.length > 0 ? (
                      tickets.map((t) => (
                        <TicketCard
                          key={t._id}
                          ticket={t}
                          onDragStart={(e) => handleDragStart(e, t, col._id)}
                          onDelete={handleTicketDeleteNotice}
                        />
                      ))
                    ) : (
                      <div className="kanban-column__empty">
                        Arrastrá tickets aquí o hacé clic en "+ Añadir"
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="board-state-view">
            <span style={{ fontSize: '3rem' }} aria-hidden="true">🧱</span>
            <h2 className="board-state-view__title">Este tablero no tiene columnas aún</h2>
            <p className="board-state-view__desc">
              Comenzá creando las columnas de tu flujo de trabajo (ej. Por Hacer, En Progreso, Terminado).
            </p>
            <Button variant="primary" onClick={() => setIsColumnModalOpen(true)}>
              + Crear primera columna
            </Button>
          </div>
        )}
      </main>

      {/* Modal: Crear Columna */}
      <Modal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        title="Crear Nueva Columna"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsColumnModalOpen(false)}
              disabled={isSubmittingColumn}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="create-column-form"
              variant="primary"
              isLoading={isSubmittingColumn || createColumnMutation.isPending}
              disabled={isSubmittingColumn || createColumnMutation.isPending}
            >
              Crear Columna
            </Button>
          </>
        }
      >
        <form
          id="create-column-form"
          onSubmit={handleSubmitColumn((values) => createColumnMutation.mutate(values))}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <Input
            id="col-name"
            label="Nombre de la Columna"
            placeholder="Ej: En Revisión"
            required
            autoFocus
            error={columnErrors.name?.message}
            {...registerColumn('name')}
          />
          <Input
            id="col-order"
            label="Orden Visual"
            type="number"
            placeholder="0"
            error={columnErrors.order?.message}
            helperText="Orden numérico de aparición de izquierda a derecha."
            {...registerColumn('order')}
          />
        </form>
      </Modal>

      {/* Modal: Crear Ticket */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Crear Nuevo Ticket"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsTicketModalOpen(false)}
              disabled={isSubmittingTicket}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="create-ticket-form"
              variant="primary"
              isLoading={isSubmittingTicket || createTicketMutation.isPending}
              disabled={isSubmittingTicket || createTicketMutation.isPending}
            >
              Crear Ticket
            </Button>
          </>
        }
      >
        <form
          id="create-ticket-form"
          onSubmit={handleSubmitTicket((values) => createTicketMutation.mutate(values))}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <Input
            id="ticket-title"
            label="Título del Ticket"
            placeholder="Ej: Implementar endpoint"
            required
            autoFocus
            error={ticketErrors.title?.message}
            {...registerTicket('title')}
          />
          <Input
            id="ticket-desc"
            label="Descripción (opcional)"
            multiline
            placeholder="Detalles adicionales sobre la tarea..."
            error={ticketErrors.description?.message}
            {...registerTicket('description')}
          />
          <Input
            id="ticket-position"
            label="Posición dentro de la columna"
            type="number"
            placeholder="0"
            error={ticketErrors.position?.message}
            {...registerTicket('position')}
          />
        </form>
      </Modal>
    </div>
  );
};

export default BoardDetailPage;
