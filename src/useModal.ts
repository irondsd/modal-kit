import { useCallback, useEffect, type MouseEvent } from 'react';
import { useUniqueId } from './useUniqueId';
import TrapFocus from '@locmod/trap-focus';
import { useFreezeBodyScroll } from './useFreezeBodyScroll';

type UseModalProps = {
  overlayClosable: boolean;
  closeModal: (withOnClose?: boolean) => void;
};

export const useModal = ({ overlayClosable, closeModal }: UseModalProps) => {
  const handleOverlayClick = useCallback(() => {
    if (overlayClosable) {
      closeModal(true);
    }
  }, [overlayClosable, closeModal]);

  const handleCloseButtonClick = useCallback(() => {
    closeModal(true);
  }, [closeModal]);

  const handleModalClick = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal(true);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal]);

  const uniqueId = useUniqueId();
  const trapFocusId = `trapfocus_${uniqueId}`;

  useEffect(() => {
    const trapFocusElement = document.getElementById(trapFocusId);

    // could be "null" if modal opened in iframe
    if (trapFocusElement) {
      const trapFocus = new TrapFocus(trapFocusElement, { withInitialFocus: false });

      trapFocusElement.focus();
      trapFocus.mount();

      return () => {
        trapFocus.unmount();
      };
    }
  }, [trapFocusId]);

  useFreezeBodyScroll();

  return {
    handleOverlayClick,
    handleCloseButtonClick,
    handleModalClick,
    trapFocusId,
  };
};
