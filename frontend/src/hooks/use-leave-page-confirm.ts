import React from "react";

const useLeavePageConfirm = (active = true) => {
  const beforeUnloadListener = (event: any) => {
    event.preventDefault();
    return (event.returnValue = "");
  };

  React.useEffect(() => {
    if (active) {
      addEventListener("beforeunload", beforeUnloadListener);
    } else {
      removeEventListener("beforeunload", beforeUnloadListener);
    }
  }, [active]);
};

export default useLeavePageConfirm;
