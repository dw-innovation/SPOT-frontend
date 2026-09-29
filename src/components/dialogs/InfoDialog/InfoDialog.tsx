import React from "react";
import ReactMarkdown from "react-markdown";

import { STRINGS } from "@/lib/const/strings/info";
import useGlobalStore from "@/stores/useGlobalStore";

import Dialog from "../Dialog";
import LegalButton from "./LegalButton";
import PrivacyManager from "./PrivacyManager";
import TAIButton from "./TAIButton";

const DIALOG_NAME = "info";

const COMPONENTS = {
  p: (props: React.HTMLProps<HTMLParagraphElement>) => {
    if (
      typeof props.children === "string" &&
      props.children.includes("[[PRIVACY_MANAGER]]")
    ) {
      const parts = props.children.split("[[PRIVACY_MANAGER]]");

      return (
        <p>
          {parts[0]}
          <PrivacyManager />
          {parts[1]}
        </p>
      );
    }
    if (
      typeof props.children === "string" &&
      props.children.includes("[[TAI_BUTTON]]")
    ) {
      const parts = props.children.split("[[TAI_BUTTON]]");

      return (
        <p>
          {parts[0]}
          <TAIButton />
          {parts[1]}
        </p>
      );
    }
    if (
      typeof props.children === "string" &&
      props.children.includes("[[LEGAL_BUTTON]]")
    ) {
      const parts = props.children.split("[[LEGAL_BUTTON]]");

      return (
        <p>
          {parts[0]}
          <LegalButton />
          {parts[1]}
        </p>
      );
    } else {
      return <p {...props} />;
    }
  },
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 {...props} className="py-2 font-bold text-md" />
  ),
  li: (props: React.HTMLProps<HTMLLIElement>) => (
    <li {...props} className="pl-2" />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul {...props} className="py-4 pl-4 list-disc" />
  ),
  ol: () => <ol className="pt-2 pl-6 font-bold list-decimal" />,
  a: (props: React.HTMLProps<HTMLAnchorElement>) => (
    <a
      {...props}
      className="underline text-accent-foreground hover:no-underline focus:outline-none hover:cursor-pointer"
    />
  ),
};

const InfoDialog = () => {
  const dialogData =
    useGlobalStore((state) => state.dialogs.info.data) || "about";

  const dialogDescription = STRINGS[`${dialogData}` as keyof typeof STRINGS];
  const dialogTitle = STRINGS[`${dialogData}Title` as keyof typeof STRINGS];

  return (
    <>
      {dialogData && (
        <Dialog dialogName={DIALOG_NAME} dialogTitle={dialogTitle} isWide>
          <div>
            <ReactMarkdown components={COMPONENTS}>
              {dialogDescription}
            </ReactMarkdown>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default InfoDialog;
