import { styles } from "@/styles";

export function StyleProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{styles}</style>
      {children}
    </>
  );
}
