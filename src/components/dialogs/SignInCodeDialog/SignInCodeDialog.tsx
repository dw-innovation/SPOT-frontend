import React, { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useGlobalStore from "@/stores/useGlobalStore";

import Dialog from "../Dialog";

const DIALOG_NAME = "signInCode";

const SignInCodeDialog: React.FC = () => {
  const email = useGlobalStore((state) => state.dialogs.signInCode.data) ?? "";
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);
  const [code, setCode] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (code.length !== 6) return;
    const params = new URLSearchParams({
      email: email.trim().toLowerCase(),
      token: code,
      callbackUrl: window.location.href,
    });
    window.location.assign(
      `${window.location.origin}/api/auth/callback/email?${params}`
    );
  };

  const handleBack = (): void => {
    setCode("");
    toggleDialog(DIALOG_NAME, false);
    toggleDialog("signIn", true);
  };

  return (
    <Dialog
      dialogName={DIALOG_NAME}
      dialogTitle="Enter your sign-in code"
      showCloseButton={false}
      preventClose={true}
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <strong>{email}</strong>. It is valid for 10
          minutes.
        </p>
        <p className="text-sm text-muted-foreground">
          Can&apos;t find the email? Please check your spam folder.
        </p>
        <Label className="text-gray-500 font-bold">Code</Label>
        <Input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          autoFocus
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          value={code}
        />
        <Button type="submit" disabled={code.length !== 6}>
          Sign in
        </Button>
        <Button type="button" variant="ghost" onClick={handleBack}>
          Use a different email or request a new code
        </Button>
      </form>
    </Dialog>
  );
};

export default SignInCodeDialog;
