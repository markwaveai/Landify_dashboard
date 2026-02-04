import React, { createContext, useContext, useState, ReactNode } from 'react';
import Snackbar, { SnackbarType } from '../components/ui/snackbar/Snackbar';

interface SnackbarContextType {
    showSnackbar: (message: string, type: SnackbarType, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<SnackbarType>('info');
    const [duration, setDuration] = useState(3000);

    const showSnackbar = (msg: string, snackType: SnackbarType = 'info', d: number = 3000) => {
        setMessage(msg);
        setType(snackType);
        setDuration(d);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar
                message={message}
                type={type}
                isOpen={isOpen}
                onClose={handleClose}
                duration={duration}
            />
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (context === undefined) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};
