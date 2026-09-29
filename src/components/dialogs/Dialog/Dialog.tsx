import {
  Dialog as RadixDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import useGlobalStore from "@/stores/useGlobalStore";
import { DialogName } from "@/types/stores/GlobalStore.interface";

type Props = {
  dialogName: DialogName;
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
  const isOpen = useGlobalStore((state) => state.dialogs[dialogName].isOpen);
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);

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
