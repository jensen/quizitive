import { Link, LinkProps } from "react-router-dom";
import cx from "classnames";

const classnames = cx(
  "text-white font-light text-xl border-2 px-8 py-2 rounded-full hover:shadow-lg hover:border-pink-400",
  "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
  "disabled:opacity-50"
);

export const PrimaryLink = (props: LinkProps & { disabled?: boolean }) => {
  if (props.disabled) {
    return <div className={cx(classnames, "opacity-50")}>{props.children}</div>;
  }

  return (
    <Link {...props} className={classnames}>
      {props.children}
    </Link>
  );
};

export const PrimaryButton = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button {...props} className={classnames}>
      {props.children}
    </button>
  );
};
