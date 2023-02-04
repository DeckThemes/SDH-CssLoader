export function FilterDropdownCustomLabel({
  filterValue,
  itemCount,
}: {
  filterValue: string;
  itemCount: number | string;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <span>{filterValue}</span>
      <span style={{ fontWeight: "bold" }}>{itemCount}</span>
    </div>
  );
}
