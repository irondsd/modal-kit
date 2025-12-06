import { createElement, lazy, Suspense, useEffect } from 'react';
import type { ComponentType, FC } from 'react';
import type { OpenModalParams } from './ModalContext';
import { useModalContext } from './ModalContext';

export const createModal = <P extends object>(
  name: string,
  loader: () => Promise<{ default: ComponentType<P & { closeModal: (withOnClose?: boolean) => void }> }>,
): [React.ComponentType<{}>, (props?: Omit<P, 'closeModal'> & OpenModalParams) => void] => {
  
  // 1. Create a Lazy wrapper using the loader function.
  // This enables true code splitting: the chunk is only fetched when this component is rendered.
  const LazyComponent = lazy(loader);

  // 2. The Modal Wrapper
  // We use createElement instead of JSX.
  // We wrap it in Suspense with fallback: null. 
  // This behaves like 'ssr: false': on the server, it renders null.
  // On the client, it waits until the specific modal is requested to resolve.
  const ModalWrapper: FC<P & { closeModal: (withOnClose?: boolean) => void }> = (props) => {
    return createElement(
      Suspense,
      { fallback: null },
      createElement(LazyComponent, props)
    );
  };

  // 3. The Connect Component (Registers the modal)
  const ConnectComponent: FC = () => {
    const { registerModal } = useModalContext();

    useEffect(() => {
      // We register the Wrapper, not the original component
      registerModal({
        name,
        component: ModalWrapper,
      });
    }, [registerModal]);

    return null; // ConnectComponent never renders visible UI itself
  };

  // 4. The Open Function
  const openFunction = (props?: Omit<P, 'closeModal'> & OpenModalParams) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('openModal', { detail: { name, props } })
      );
    }
  };

  return [ConnectComponent, openFunction];
};
