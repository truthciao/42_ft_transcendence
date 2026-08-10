import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ConfirmContext, type ConfirmOptions } from "./confirm-context";

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({
          confirmLabel: t('common.confirm'),
          cancelLabel: t('common.cancel'),
          ...options,
          resolve,
        });
      }),
    [t],
  );

  function close(confirmed: boolean) {
    pending?.resolve(confirmed);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={pending !== null}
        title={pending?.title ?? ''}
        description={pending?.confirmLabel ?? ''}
        confirmLabel={pending?.confirmLabel ?? ''}
        cancelLabel={pending?.cancelLabel ?? ''}
        variant={pending?.variant}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    </ConfirmContext.Provider>
  )
}
