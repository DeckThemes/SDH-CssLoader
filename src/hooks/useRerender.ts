import { useState, useEffect } from "react";

// This should only be used to fix weird bugs with how valve's toggles/dropdowns/etc don't update state
// If used, state why in a comment next to the invocation
export function useRerender(): [boolean, () => void] {
  const [render, setRender] = useState<boolean>(true);
  useEffect(() => {
    if (render === false) {
      setTimeout(() => setRender(true), 100);
    }
  }, [render]);
  const rerender = () => {
    setRender(false);
  };

  return [render, rerender];
}
