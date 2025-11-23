'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

let toastId = 0;
const toastQueue = [];
const listeners = new Set();

export function showToast(message, type = 'success') {
  const id = toastId++;
  const toast = { id, message, type };
  toastQueue.push(toast);
  listeners.forEach(listener => listener([...toastQueue]));
  
  setTimeout(() => {
    const index = toastQueue.findIndex(t => t.id === id);
    if (index > -1) {
      toastQueue.splice(index, 1);
      listeners.forEach(listener => listener([...toastQueue]));
    }
  }, 3000);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    const listener = (newToasts) => setToasts(newToasts);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-6 z-[100] space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-white rounded-xl shadow-2xl border-2 border-green-200 p-4 min-w-[320px] animate-in slide-in-from-right fade-in duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-text-primary font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => {
                const index = toastQueue.findIndex(t => t.id === toast.id);
                if (index > -1) {
                  toastQueue.splice(index, 1);
                  setToasts([...toastQueue]);
                }
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}