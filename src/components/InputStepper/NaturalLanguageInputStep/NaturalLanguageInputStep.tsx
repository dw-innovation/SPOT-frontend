"use client";

import { SearchIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import SpotLogo from "@/assets/icons/SpotLogo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trackAction } from "@/lib/utils";
import useGlobalStore from "@/stores/useGlobalStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

import InputContainer from "../InputContainer";

const PLACEHOLDERS = [
  "Find me a tram stop next to a park within 150 meters of a traffic light and a parking garage in Prague.",
  "I can see a car park, a café called “club” and a marina within 150 meters of each other, where in The Hague is that?",
  "Where is a bus station directly in front of a shopping mall in Yangon?",
];

type Props = {
  minimal?: boolean;
};

const NaturalLanguageInputStep = ({ minimal }: Props) => {
  const { data: sessionData } = useSession();
  const [shouldUnmount, setShouldUnmount] = useState(false);
  const [typingActive, setTypingActive] = useState(true);
  const nextStep = useGlobalStore((state) => state.nextStep);
  const setNaturaLanguageSentence = useSpotQueryStore(
    (state) => state.setNaturaLanguageSentence
  );
  const naturalLanguageSentence = useSpotQueryStore(
    (state) => state.naturalLanguageSentence
  );
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);
  const setSearchActive = useGlobalStore((state) => state.setSearchActive);

  const handleSearchTrigger = () => {
    if (naturalLanguageSentence === "") return;
    trackAction("inputStepper", "nlTransformation", naturalLanguageSentence);
    setShouldUnmount(true);
    setTimeout(() => {
      nextStep();
      setSearchActive(true);
      // The remaining steps run inline in the query panel.
      toggleDialog("inputStepper", false);
    }, 200);
  };

  const [currentText, setCurrentText] = useState<string>("");
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  useEffect(() => {
    if (!typingActive) return;
    let timeoutId: NodeJS.Timeout;

    if (direction === "forward") {
      if (currentText === PLACEHOLDERS[placeholderIndex]) {
        timeoutId = setTimeout(() => setDirection("backward"), 1000);
      } else {
        timeoutId = setTimeout(() => {
          setCurrentText(
            PLACEHOLDERS[placeholderIndex].substring(0, currentText.length + 1)
          );
        }, 50);
      }
    } else {
      if (currentText === "") {
        timeoutId = setTimeout(() => {
          setPlaceholderIndex(
            (prevIndex) => (prevIndex + 1) % PLACEHOLDERS.length
          );
          setDirection("forward");
        }, 1000);
      } else {
        timeoutId = setTimeout(() => {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        }, 50);
      }
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentText, direction, placeholderIndex, typingActive]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prevShow) => !prevShow);
    }, 500);

    return () => {
      clearInterval(cursorInterval);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const displayedText = `${currentText}${
    showCursor && typingActive ? "|" : ""
  }`;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchTrigger();
    }
  };

  const handleLogin = () => {
    toggleDialog("inputStepper");
    toggleDialog("signIn");
  };

  const handleFocus = () => {
    setTypingActive(false);
    setCurrentText("");
  };

  return (
    <InputContainer shouldUnmount={shouldUnmount}>
      <div className="flex items-center justify-center w-full h-full overflow-hidden">
        <div className="flex flex-col w-full gap-4">
          {!minimal && (
            <div className="flex flex-col items-start w-full gap-2">
              <SpotLogo />
              <h2 className="pb-1 font-semibold leading-none text-center text-md font-inter text-muted-foreground ">
                Geospatial search for OpenStreetMap
              </h2>
            </div>
          )}
          {!sessionData && (
            <span>
              <p className="pb-2">
                Spot allows you to search for relations between entities in
                OpenStreetMap.
              </p>
              <p className="pb-2">
                Spot can analyse your prompt for entities, their relations and
                location and display the matching results on a map.
              </p>
              <p>Like so:</p>
            </span>
          )}

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-6"
          >
            <Textarea
              className={"w-full text-xl shadow-lg focus-visible:"}
              rows={4}
              placeholder={displayedText}
              onChange={(e) => setNaturaLanguageSentence(e.target.value)}
              onFocus={handleFocus}
              onBlur={() => setTypingActive(true)}
              value={naturalLanguageSentence}
              onKeyDown={handleKeyPress}
              disabled={!sessionData}
            />
            {sessionData ? (
              <Button
                onClick={handleSearchTrigger}
                disabled={naturalLanguageSentence === ""}
                type="button"
              >
                <SearchIcon />
                Search
              </Button>
            ) : (
              <Button onClick={handleLogin}>Sign In</Button>
            )}
          </form>
        </div>
      </div>
    </InputContainer>
  );
};

export default NaturalLanguageInputStep;
