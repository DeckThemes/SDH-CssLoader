export function FilterOptionLabel({
  text,
  itemCount,
}: {
  text: string;
  itemCount: number | string;
}) {
  return (
    <div className="flex w-full justify-between">
      <span>{text}</span>
      <span className="font-bold">{itemCount}</span>
    </div>
  );
}
