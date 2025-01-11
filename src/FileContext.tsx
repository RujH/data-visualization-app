// src/FileContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context's shape
interface FileContextType {
  files: FileList | null;
  setFiles: (files: FileList | null) => void;
}

// Create the context
const FileContext = createContext<FileContextType | undefined>(undefined);

// Create a provider component
export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<FileList | null>(null);

  return (
    <FileContext.Provider value={{ files, setFiles }}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook for convenience
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};
