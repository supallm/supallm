import Logo from "./logo";

export const GlobalLoading = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Logo width={120} className="animate-pulse animate-scale" />
    </div>
  );
};
