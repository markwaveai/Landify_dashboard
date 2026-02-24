import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Only scroll to top on new page navigations (PUSH)
    // Don't scroll to top on back/forward navigations (POP)
    if (navType === "PUSH") {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
}
