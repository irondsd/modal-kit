'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ModalConfig = {
  name: string;
  component: React.ComponentType<any>;
};

export type ModalState = {
  name: string;
  props: OpenModalParams;
};

export type OpenModalParams = {
  [key: string]: any;
  onClose?: () => void;
};

export type ModalVisibilityProps = {
  closeModal: (withOnClose?: boolean) => void;
};

type ModalContextValue = {
  modalStack: ModalState[];
  openModal: (name: string, props?: OpenModalParams) => void;
  closeModal: (withOnClose?: boolean) => void;
  registerModal: (config: ModalConfig) => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const ModalRenderer = () => {
  const { modalStack, closeModal } = useModalContext();

  if (modalStack.length === 0) {
    return null;
  }

  // Render all modals in the stack
  return (
    <>
      {modalStack.map((modalState, index) => {
        const ModalComponent = modalRegistry.get(modalState.name);

        if (!ModalComponent) {
          return null;
        }

        return (
          <ModalComponent
            key={`${modalState.name}-${index}`}
            {...modalState.props}
            closeModal={(withOnClose: boolean) => closeModal(withOnClose)}
          />
        );
      })}
    </>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider');
  }
  return context;
};

const modalRegistry = new Map<string, React.ComponentType<any>>();

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalStack, setModalStack] = useState<ModalState[]>([]);

  const registerModal = useCallback((config: ModalConfig) => {
    modalRegistry.set(config.name, config.component);
  }, []);

  const openModalInternal = useCallback((name: string, props: OpenModalParams = {}) => {
    if (!modalRegistry.has(name)) {
      console.error(`Modal "${name}" is not registered`);
      return;
    }
    setModalStack((prevStack) => [...prevStack, { name, props }]);
  }, []);

  const closeModal = useCallback((withOnClose = true, stackIndex?: number) => {
    setModalStack((prevStack) => {
      const indexToRemove = stackIndex !== undefined ? stackIndex : prevStack.length - 1;
      const modalToClose = prevStack[indexToRemove];

      if (withOnClose && modalToClose?.props.onClose) {
        modalToClose.props.onClose();
      }

      return prevStack.filter((_, index) => index !== indexToRemove);
    });
  }, []);

  // Listen for global openModal events
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      const { name, props } = event.detail;
      openModalInternal(name, props);
    };

    window.addEventListener('openModal', handleOpenModal as EventListener);
    return () => {
      window.removeEventListener('openModal', handleOpenModal as EventListener);
    };
  }, [openModalInternal]);

  return (
    <ModalContext.Provider
      value={{
        modalStack,
        openModal: openModalInternal,
        closeModal,
        registerModal,
      }}
    >
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  );
};
