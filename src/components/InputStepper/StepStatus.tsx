import React from "react";

import LoadingSpinner from "@/components/LoadingSpinner";

/**
 * Progress row for a search step running inline in the query panel.
 *
 * The steps used to fill a dialog, where a large spinner and a carousel of
 * reassuring sentences had room. Inline next to the conversation they need to
 * be one quiet line.
 */
const StepStatus = ({ label }: { label: string }) => (
  <div
    role="status"
    className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 border rounded-md bg-gray-50"
  >
    <LoadingSpinner size="1rem" />
    {label}
  </div>
);

export default StepStatus;
