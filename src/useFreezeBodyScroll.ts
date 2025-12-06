'use client';

import { useCallback, useEffect } from 'react';

const getScrollBarWidth = () => {
  const outer = document.createElement('div');

  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  // @ts-expect-error  Property 'msOverflowStyle' does not exist on type 'CSSStyleDeclaration'.
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;

  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');

  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;

  outer.parentNode!.removeChild(outer);

  return widthNoScroll - widthWithScroll;
};

let openedModalsCount = 0;

export const useFreezeBodyScroll = (enabled = true) => {
  const translateRoot = useCallback((offset: number) => {
    // can't use transform, because it creates new fixed layer and breaks fixed elements
    const element = document.getElementById('__next');

    if (element && offset) element.style.marginTop = `${offset}px`;
  }, []);

  const addStyles = useCallback(() => {
    document.body.classList.add('body-scroll-frozen');
    document.body.style.paddingRight = `${getScrollBarWidth()}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translateRoot]);

  const removeStyles = useCallback(() => {
    document.body.classList.remove('body-scroll-frozen');
    document.body.style.paddingRight = '0px';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translateRoot]);

  useEffect(() => {
    if (enabled) {
      if (openedModalsCount === 0) {
        addStyles();
      }
      openedModalsCount++;

      return () => {
        openedModalsCount--;

        if (openedModalsCount === 0) {
          removeStyles();
        }
      };
    }
  }, [addStyles, removeStyles, enabled]);
};
