"use client";

import { useState, useEffect } from "react";
import { isRegistrationClosed, REGISTRATION_DEADLINE } from "./constants";

export function useIsRegistrationClosed() {
  const [closed, setClosed] = useState<boolean>(() => isRegistrationClosed());

  useEffect(() => {
    setClosed(isRegistrationClosed());

    if (isRegistrationClosed()) {
      return;
    }

    const timeUntilClose = REGISTRATION_DEADLINE - Date.now();
    if (timeUntilClose > 0) {
      const timer = setTimeout(() => {
        setClosed(true);
      }, timeUntilClose);
      return () => clearTimeout(timer);
    } else {
      setClosed(true);
    }
  }, []);

  return closed;
}
