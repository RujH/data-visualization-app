import 'react';

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: boolean;
  }
}

// src/global.d.ts
declare module '*.png' {
  const src: string;
  export default src;
}