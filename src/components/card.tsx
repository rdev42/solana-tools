import clsx from "clsx";
import { Heading } from "./heading";
import { Link } from "react-router-dom";

export function Cards({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="card"
      {...props}
      className={clsx(
        className,
        "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4",
      )}
    />
  );
}

export function Card({
  className,
  title,
  to,
  disabled,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"p"> & {
  title?: string;
  to?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (!to) {
    return (
      <div
        onClick={onClick}
        className={clsx(
          className,
          disabled
            ? "cursor-default dark:bg-zinc-800"
            : "cursor-pointer dark:bg-zinc-800 hover:dark:bg-zinc-950",
          "bg-white rounded-lg p-4 transition-colors",
        )}
      >
        <Heading level={3}>{title}</Heading>
        {props.children}
      </div>
    );
  }

  return (
    <Link to={to}>
      <div
        className={clsx(
          className,
          disabled
            ? "cursor-default dark:bg-zinc-800"
            : "cursor-pointer dark:bg-zinc-800 hover:dark:bg-zinc-950",
          "bg-white rounded-lg p-4 transition-colors",
        )}
      >
        <Heading level={3}>{title}</Heading>
        {props.children}
      </div>
    </Link>
  );
}
