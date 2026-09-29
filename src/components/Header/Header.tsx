"use client";

import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";

import SpotLogo from "@/assets/icons/SpotLogo";
// import SpotSelector from "@/components/SpotSelector";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useStrings from "@/lib/contexts/useStrings";
import useGlobalStore from "@/stores/useGlobalStore";

import { useMenu } from "./Context";
import MenuItems from "./MenuItems";

const Header = () => {
  const { open, setOpen } = useMenu();
  const { commonMenu } = useStrings();

  const session = useSession();

  const toggleDialog = useGlobalStore((state) => state.toggleDialog);

  return (
    <div className="flex gap-2">
      <div className="flex items-center justify-between flex-1">
        <div className="flex items-end gap-5 ml-2">
          <div
            className="flex gap-2 items-end flex-row"
            style={{ transform: "translateY(-4px)" }}
          >
            <div style={{ transform: "translateY(4px)" }}>
              <SpotLogo />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-xs text-muted-foreground">
                {process.env.NEXT_PUBLIC_VERSION}
              </p>
            </div>
          </div>
        </div>
        <h2
          className="pb-1 text-lg font-semibold font-inter text-muted-foreground "
          style={{ transform: "translateY(4px)" }}
        >
          Geospatial search for OpenStreetMap
        </h2>
        <div className="items-start hidden gap-2 md:flex">
          {/* <SpotSelector /> */}
          <MenuItems />
        </div>
        <div className="flex items-start gap-2 md:hidden">
          <Sheet open={open} onOpenChange={(state) => setOpen(state)}>
            <SheetTrigger className="block md:hidden" asChild>
              <Button onClick={() => setOpen((prev) => !prev)}>
                <HamburgerMenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent className="md:hidden">
              <SheetHeader>
                <SheetTitle>{commonMenu()}</SheetTitle>
                <SheetDescription>
                  <MenuItems />
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Header;
