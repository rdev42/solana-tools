/**
 * TODO: Update this component to use your client-side framework's link
 * component. We've provided examples of how to do this for Next.js, Remix, and
 * Inertia.js in the Catalyst documentation:
 *
 * https://catalyst.tailwindui.com/docs#client-side-router-integration
 */

import * as Headless from "@headlessui/react";
import React, { forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";
export const Link = forwardRef(function Link(
  props: { href: string } & React.ComponentPropsWithoutRef<"a">,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  if (props.href.startsWith("http")) {
    return (
      <Headless.DataInteractive {...props} ref={ref}>
        <a
          {...props}
          ref={ref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:underline"
        />
      </Headless.DataInteractive>
    );
  }

  return (
    <Headless.DataInteractive>
      <RouterLink to={props.href} {...props} />
    </Headless.DataInteractive>
  );
});
