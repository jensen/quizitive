import cx from "classnames";

export default function Input({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  return (
    <input
      className={cx("w-full rounded-r-lg px-4 py-2 text-black", className)}
      {...props}
    />
  );
}
