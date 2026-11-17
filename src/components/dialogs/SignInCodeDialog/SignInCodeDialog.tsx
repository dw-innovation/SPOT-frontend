import React, { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import useGlobalStore from "@/stores/useGlobalStore";

import Dialog from "../Dialog";

const DIALOG_NAME = "signInCode";
const CODE_LENGTH = 6;

const SignInCodeDialog: React.FC = () => {
  const email = useGlobalStore((state) => state.dialogs.signInCode.data) ?? "";
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);
  const [code, setCode] = useState<string>("");

  const redeem = (token: string): void => {
    if (token.length !== CODE_LENGTH) return;
    const params = new URLSearchParams({
      email: email.trim().toLowerCase(),
      token,
      callbackUrl: window.location.href,
    });
    window.location.assign(
      `${window.location.origin}/api/auth/callback/email?${params}`
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    redeem(code);
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
        <InputOTP
          name="code"
          maxLength={CODE_LENGTH}
          pattern="^[0-9]*$"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          containerClassName="justify-center py-2"
          value={code}
          onChange={setCode}
          onComplete={redeem}
        >
          <InputOTPGroup>
            {Array.from({ length: CODE_LENGTH }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button type="submit" disabled={code.length !== CODE_LENGTH}>
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
