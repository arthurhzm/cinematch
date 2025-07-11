import { createContext, useContext, type ReactNode } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastContextProps {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {

    const showSuccess = (message: string) => {
        toast.success(message);
    };

    const showError = (message: string) => {
        toast.error(message);
    };

    const showWarning = (message: string) => {
        toast.warning(message);
    };

    const showInfo = (message: string) => {
        toast.info(message);
    };

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
            {children}
            <ToastContainer
                autoClose={2500}
                pauseOnFocusLoss={false}
                hideProgressBar={true}
                newestOnTop={true}
                pauseOnHover={false}
            />
        </ToastContext.Provider>
    );
};