import * as icons from "lucide-react";
import { HelpCircle, type LucideProps } from "lucide-react";

export type IconName = keyof typeof icons;

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = (icons as unknown as Record<string, React.ComponentType<LucideProps>>)[
    name
  ];

  if (!Icon) return <HelpCircle {...props} />;

  return <Icon {...props} />;
}
