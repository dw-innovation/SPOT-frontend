import { useEffect, useState } from "react";

import {
  Dialog as RadixDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import useGlobalStore from "@/stores/useGlobalStore";

type Props = {
  dialogName: string;
  dialogTitle?: string;
  dialogDescription?: string;
  children: React.ReactNode;
  className?: string;
  isWide?: boolean;
  showCloseButton?: boolean;
  preventClose?: boolean;
};

const Dialog = ({
  dialogName,
  dialogTitle,
  dialogDescription,
  children,
  className,
  isWide,
  showCloseButton,
  preventClose,
}: Props) => {
  const dialogs = useGlobalStore((state) => state.dialogs);
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialogState =
      dialogs.find((dialog) => dialog.name === dialogName)?.isOpen || false;
    setIsOpen(dialogState);
  }, [dialogName, dialogs]);

  return (
    <RadixDialog open={isOpen} onOpenChange={() => toggleDialog(dialogName)}>
      <DialogContent
        className={cn(
          isWide ? "max-w-[800px]" : "sm:max-w-[425px]",
          "z-[20000] max-h-[90vh]",
          "overflow-auto",
          className
        )}
        showCloseButton={showCloseButton}
        onInteractOutside={(e) => {
          preventClose && e.preventDefault();
        }}
        onEscapeKeyDown={(e) => preventClose && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && (
            <DialogDescription
              dangerouslySetInnerHTML={{ __html: dialogDescription }}
            />
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </RadixDialog>
  );
};

export default Dialog;
