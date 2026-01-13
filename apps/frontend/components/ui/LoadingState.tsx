import { Loading } from "./Loading";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Cargando…" }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loading size="lg" />
      <p className="mt-4 text-gray-600 text-sm md:text-base">{message}</p>
    </div>
  );
}

export default LoadingState;
