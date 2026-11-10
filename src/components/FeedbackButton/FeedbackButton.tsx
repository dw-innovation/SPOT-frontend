import { useMutation } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import ThumbIcon from "@/assets/icons/ThumbIcon";
import { saveFeedback } from "@/lib/feedback";
import useSaveSession from "@/lib/hooks/useSaveSession";

import LoadingSpinner from "../LoadingSpinner";
import { Button } from "../ui/button";
import FeedbackLabel from "./FeedbackLabel";

const FeedbackButton = () => {
  const [sessionLink, setSessionLink] = useState<string>();
  const [feedbackID, setFeedbackID] = useState<string>();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hover, setHover] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [thumbsFeedback, setThumbsFeedback] = useState<boolean | undefined>();

  const ref = useRef<HTMLDivElement>(null);
  const sessionMutation = useSaveSession({});

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
      setHeight(ref.current.offsetHeight);
    }
  }, []);

  const { mutate } = useMutation({
    mutationFn: async ({
      thumbs,
      textFeedback,
    }: {
      thumbs?: boolean;
      textFeedback?: string;
    }) => {
      thumbs && setThumbsFeedback(thumbs);
      const link =
        sessionLink ??
        (await sessionMutation.mutateAsync().then((link) => {
          setSessionLink(link);
          return link;
        }));

      if (!link) throw new Error("Session link is missing");

      return saveFeedback(link, thumbs, textFeedback, feedbackID);
    },
    onSettled: (id) => {
      if (id) setFeedbackID(id);
    },
  });

  const handleTextSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    mutate({ textFeedback: text });
    setSubmitted(true);
  };

  return (
    <div
      className="flex items-center gap-1 hover:brighter font-noto fixed right-0 top-1/2 transition-all"
      style={{
        transform: `translateX(${hover ? 0 : width}px)`,
        zIndex: 100000,
        // Centred vertically, clear of the legend and layer selector that
        // stack up from the bottom-right corner.
        marginTop: `-${height / 2}px`,
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <div className="grid grid-cols-[auto,1fr]">
        <div
          className="p-2 bg-orange-600 rounded-l-md flex flex-col items-center justify-center text-white"
          style={{ height: `${height}px` }}
        >
          {sessionMutation.isPending ? <LoadingSpinner /> : <FeedbackLabel />}
        </div>

        <div className="bg-white" ref={ref}>
          <div className="flex flex-col items-center gap-2 p-2">
            <span className="text-sm font-bold text-orange-600">
              Do you enjoy using SPOT?
            </span>
            <div className="flex gap-4">
              <button
                className="text-green-500 hover:text-green-700 disabled:text-gray-500"
                onClick={() => mutate({ thumbs: true })}
                disabled={!!feedbackID}
              >
                <ThumbIcon />
              </button>
              <button
                className="text-orange-500 hover:text-orange-700 rotate-180 disabled:text-gray-500"
                onClick={() => mutate({ thumbs: false })}
                disabled={!!feedbackID}
              >
                <ThumbIcon />
              </button>
            </div>
          </div>
        </div>

        <div
          className="bg-white transition-all col-start-2"
          style={{ transform: `translateX(${feedbackID ? 0 : width + 8}px)` }}
        >
          <form className="flex flex-col p-2 gap-2">
            <textarea
              className="border rounded-sm text-sm p-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={submitted}
              placeholder={
                thumbsFeedback
                  ? "Want to share more? What did you like?"
                  : "Want to share more? What didn’t you like?"
              }
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTextSubmit}
            >
              {submitted && <CheckIcon className="mr-1 h-4 w-4" />}
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackButton;
