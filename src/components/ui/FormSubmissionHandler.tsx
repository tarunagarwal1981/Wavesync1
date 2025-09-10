import React from "react";
import styles from "./FormSubmissionHandler.module.css";
import { SuccessAnimation } from "./SuccessAnimation";
import { useToast } from "../../hooks/useToast";

export interface FormSubmissionHandlerProps {
  onSubmit: (data: any) => Promise<void> | void;
  children: (props: {
    handleSubmit: (data: any) => void;
    isSubmitting: boolean;
    showSuccess: boolean;
  }) => React.ReactNode;
  successMessage?: string;
  errorMessage?: string;
}

export const FormSubmissionHandler: React.FC<FormSubmissionHandlerProps> = ({
  onSubmit,
  children,
  successMessage = "Form submitted successfully!",
  errorMessage = "Failed to submit form. Please try again."
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      await onSubmit(data);
      setShowSuccess(true);
      success(successMessage);
      
      // Hide success animation after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {showSuccess && (
        <div className={styles.successOverlay}>
          <SuccessAnimation isVisible={showSuccess} />
        </div>
      )}
      {children({ handleSubmit, isSubmitting, showSuccess })}
    </div>
  );
};

export default FormSubmissionHandler;
