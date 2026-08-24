import { useTilt } from '../hooks/useTilt';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  wrapClassName?: string;
  max?: number;
  onClick?: () => void;
}

export default function TiltCard({ children, className = '', wrapClassName = '', max = 8, onClick }: TiltCardProps) {
  const ref = useTilt<HTMLDivElement>({ max });

  return (
    <div className={`tilt-wrap ${wrapClassName}`}>
      <div ref={ref} className={`tilt-card ${className}`} onClick={onClick}>
        {children}
      </div>
    </div>
  );
}
