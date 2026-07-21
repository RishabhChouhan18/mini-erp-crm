export const generateChallanNumber = (): string => {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const uniquePart = Date.now()
    .toString()
    .slice(-6);

  return `CH-${date}-${uniquePart}`;
};