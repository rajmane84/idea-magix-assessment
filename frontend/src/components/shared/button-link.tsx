import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

type ButtonLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants> & { className?: string };

/** Button styled as a Next.js Link, using base-ui's `render` composition pattern. */
export function ButtonLink({ variant, size, className, href, children, ...props }: ButtonLinkProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      nativeButton={false}
      render={<Link href={href} {...props} />}
    >
      {children}
    </Button>
  );
}
