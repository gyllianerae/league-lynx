import { toast } from 'sonner';

export const handleError = (error: any, defaultMessage: string) => {
  console.error('Error:', error);
  const errorMessage = error.message || defaultMessage;
  toast.error(errorMessage);
  throw error;
};