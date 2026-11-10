import { signIn } from "next-auth/react";
import React, { ChangeEvent, FormEvent, useState } from "react";

import SpotLogo from "@/assets/icons/SpotLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Dialog from "../Dialog";

const DIALOG_NAME = "signIn";

const SignInDialog: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUserName(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    signIn("credentials", {
      redirect: true,
      username: userName,
      password: password,
    });
  };

  return (
    <Dialog
      dialogName={DIALOG_NAME}
      showCloseButton={false}
      preventClose={true}
    >
      <div className="flex items-center flex-col gap-2">
        <div className="flex flex-col items-start w-full gap-2 mb-4">
          <SpotLogo />
          <h2 className="pb-1 font-semibold leading-none text-center text-md font-inter text-muted-foreground ">
            Geospatial search for OpenStreetMap
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-2">
            <Label className="text-gray-500 font-bold">Username</Label>
            <Input
              name="username"
              onChange={handleUserNameChange}
              value={userName}
            />

            <Label className="text-gray-500 font-bold">Password</Label>
            <Input
              type="password"
              name="password"
              onChange={handlePasswordChange}
              value={password}
            />
          </div>

          <Button type="submit">Sign in with Credentials</Button>
        </form>
      </div>
    </Dialog>
  );
};

export default SignInDialog;
