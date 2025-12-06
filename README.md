# @irondsd/modal-kit

A lightweight, type-safe React modal library with built-in accessibility features, focus trapping, and body scroll freezing. Perfect for managing multiple modals with a clean, functional API.

## Features

- 🎯 **Type-Safe**: Full TypeScript support with proper type inference
- ♿ **Accessible**: Built-in focus trapping and keyboard navigation (Escape to close)
- 🔒 **Context-Based**: Uses React Context API for centralized modal management
- 📚 **Modal Stacking**: Support for multiple modals displayed simultaneously
- 🎨 **Customizable**: Pass any props to your modal components
- ⚡ **Lightweight**: Minimal dependencies, optimized for performance
- 🚫 **Body Scroll Management**: Automatically freezes body scroll when modals open
- 🎭 **Lazy Loading**: Components are lazily loaded when mounted

## Installation

```bash
npm install @irondsd/modal-kit
# or
yarn add @irondsd/modal-kit
# or
pnpm add @irondsd/modal-kit
```

## Quick Start

### 1. Wrap Your App with ModalProvider

In your root `layout.tsx` or `App.tsx`:

```tsx
import { ModalProvider } from '@irondsd/modal-kit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
```

### 2. Create Your Modal Component

Create a modal component that accepts a `closeModal` function:

```tsx
'use client';
import type { FC } from 'react';
import { useModal } from '@irondsd/modal-kit';

type MyModalProps = {
  title: string;
  closeModal: (withOnClose?: boolean) => void;
};

const MyModalContent: FC<MyModalProps> = ({ title, closeModal }) => {
  const { handleOverlayClick, handleCloseButtonClick, handleModalClick, trapFocusId } = useModal({
    overlayClosable: true,
    closeModal,
  });

  return (
    <div onClick={handleOverlayClick} className="overlay">
      <div id={trapFocusId} role="dialog" aria-modal="true" onClick={handleModalClick}>
        <h2>{title}</h2>
        <button onClick={handleCloseButtonClick}>Close</button>
      </div>
    </div>
  );
};

export default MyModalContent;
```

### 3. Register and Use Your Modal

```tsx
// @/modals/MyModal/index.ts
"use client"

import { createModal } from '@irondsd/modal-kit';

const [MyModal, openMyModal] = createModal('MyModal', () => import('./MyModalContent'));
export { MyModal, openMyModal };
```

**⚠️ Important: The `"use client"` directive is required** (when using Next.js App Router or similar frameworks with Server/Client Component boundaries). The `createModal` function uses React hooks internally, so it must be marked as a client component. Without this directive, you'll get the error: `Attempted to call createModal() from the server but createModal is on the client.`

### 4. Register the Modal and Open It

In your root layout:

```tsx
import { MyModal } from '@/modals/MyModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <MyModal />
      {children}
    </ModalProvider>
  );
}
```

Then open it from anywhere:

```tsx
import { openMyModal } from '@/modals/MyModal';

export function MyComponent() {
  return (
    <button onClick={() => openMyModal({ title: 'Hello World' })}>
      Open Modal
    </button>
  );
}
```

## API Reference

### `ModalProvider`

The root provider component that manages modal state and rendering.

**Props:**
- `children`: React elements to wrap

```tsx
<ModalProvider>
  {children}
</ModalProvider>
```

### `createModal<P>(name: string, component: ComponentType<P>)`

Creates a modal registration and returns a tuple with a component and open function.

**Parameters:**
- `name`: Unique identifier for the modal
- `loader`: Function that returns a Promise resolving to the component (e.g. `() => import('./MyComponent')`)

**Returns:**
- `[ConnectComponent, openFunction]`: A tuple containing:
  - `ConnectComponent`: Component to register the modal (place in your root layout)
  - `openFunction`: Function to open the modal from anywhere

```tsx
// @/modals/MyModal/index.ts
const [MyModalComponent, openMyModal] = createModal('MyModal', () => import('./MyModalContent'));
```

### `useModal({ overlayClosable, closeModal })`

Hook that handles modal interactions and accessibility features.

**Parameters:**
- `overlayClosable: boolean` - Allow closing modal by clicking overlay
- `closeModal: (withOnClose?: boolean) => void` - Callback to close the modal

**Returns:**
```tsx
{
  handleOverlayClick: () => void,      // Call on overlay click
  handleCloseButtonClick: () => void,  // Call on close button click
  handleModalClick: (e: MouseEvent) => void,  // Call on modal content click (prevents propagation)
  trapFocusId: string,                 // Set as id on the modal dialog element
}
```

```tsx
const { handleOverlayClick, handleCloseButtonClick, handleModalClick, trapFocusId } = useModal({
  overlayClosable: true,
  closeModal,
});
```

### `useModalContext()`

Hook to access the modal context (for advanced use cases).

**Returns:**
```tsx
{
  modalStack: ModalState[],              // Array of open modals
  openModal: (name: string, props?: OpenModalParams) => void,  // Open a modal
  closeModal: (withOnClose?: boolean) => void,  // Close the top modal
  registerModal: (config: ModalConfig) => void,  // Register a modal
}
```

### `useFreezeBodyScroll(enabled?: boolean)`

Hook that freezes body scroll when modals are open. Automatically called by `useModal` but can be used independently.

**Parameters:**
- `enabled: boolean` (default: `true`) - Enable/disable scroll freezing

```tsx
useFreezeBodyScroll(true);
```

Requires the following CSS class on the `body` element:

```css
body.body-scroll-frozen {
  overflow: hidden;
}
```

## Advanced Examples

### Example 1: Modal with Custom Props

```tsx
// @/modals/ConfirmModal/ConfirmModal.tsx
'use client';

import type { FC } from 'react';
import { createModal, useModal } from '@irondsd/modal-kit';

type ConfirmModalProps = {
  title: string;
  message: string;
  onConfirm?: () => void;
  closeModal: (withOnClose?: boolean) => void;
};

export default function ConfirmModal({ title, message, onConfirm, closeModal }: ConfirmModalProps) {
  const { handleOverlayClick, handleModalClick, trapFocusId } = useModal({
    overlayClosable: false,
    closeModal,
  });

  const handleConfirm = () => {
    onConfirm?.();
    closeModal(true);
  };

  return (
    <div onClick={handleOverlayClick} className="overlay">
      <div id={trapFocusId} role="dialog" aria-modal="true" onClick={handleModalClick}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={() => closeModal(false)}>Cancel</button>
      </div>
    </div>
  );
};
```

```tsx
// @/modals/ConfirmModal/index.ts
"use client"

import { createModal } from '@irondsd/modal-kit';

const [ConfirmModal, openConfirmModal] = createModal('ConfirmModal', () => import('./ConfirmModal'));
export { ConfirmModal, openConfirmModal };
```

```ts
import { openConfirmModal } from '@/modals/ConfirmModal'

// open it like that
openConfirmModal({
  title: 'Delete Item',
  message: 'Are you sure?',
  onConfirm: () => console.log('Confirmed!'),
});
```

### Example 2: Stacked Modals

Multiple modals can be open at the same time:

```tsx
import { openConfirmModal } from '@/modals/ConfirmModal';
import { openInfoModal } from '@/modals/InfoModal';

// Open first modal
openInfoModal({ title: 'Info' });

// Open second modal (will stack on top)
openConfirmModal({
  title: 'Confirm',
  message: 'Continue?',
});

// Close top modal only
closeModal(true);
```

### Example 3: Modal with onClose Callback

```tsx
openMyModal({
  title: 'My Modal',
  onClose: () => {
    console.log('Modal was closed with onClose callback');
  },
});
```

Pass `true` as the argument to `closeModal` to trigger the `onClose` callback.

## Accessibility Features

- **Focus Trapping**: Focus is automatically trapped within the modal using the `@locmod/trap-focus` library
- **Keyboard Navigation**: Press `Escape` to close the modal
- **ARIA Attributes**: Proper `role="dialog"` and `aria-modal="true"` attributes
- **Body Scroll Freezing**: Body scroll is automatically disabled while modals are open
- **Scroll Bar Width Compensation**: Adds padding to prevent layout shift when scrollbars disappear

## Styling Example

Here's a basic CSS/SCSS example to style your modals:

```scss
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  [role='dialog'] {
    background: white;
    border-radius: 8px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }
}

/* Freeze body scroll styles */
:global(.body-scroll-frozen) {
  overflow: hidden;
}
```

## Requirements

- **React**: 16.8.0 or higher (requires Hooks)
- **TypeScript**: Recommended but not required

## Dependencies

- `@locmod/trap-focus`: For focus trapping functionality

## Browser Support

Works in all modern browsers that support:
- React Hooks (16.8+)
- CustomEvent
- Map/WeakMap
- ES6 features

## Note on Lazy Loading

Modals are **fully lazy-loaded**. The modal content is fetched from the server only when `openModal()` is called (or when the component is rendered), reducing the initial bundle size.

You must pass a loader function (like `() => import('./MyComponent')`) to `createModal` instead of the component directly.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

[@irondsd](https://github.com/irondsd)
