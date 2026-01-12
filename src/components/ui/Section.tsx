import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { cn } from '../../lib/utils';

export default function Section({
  children,
  className,
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={cn(
        'py-12 bg-white transition-all duration-500',
        animate && !isVisible && 'opacity-0 translate-y-4',
        animate && isVisible && 'opacity-100 translate-y-0',
        className,
      )}
    >
      <div className={cn('container mx-auto px-4', className)}>{children}</div>
    </section>
  );
}
