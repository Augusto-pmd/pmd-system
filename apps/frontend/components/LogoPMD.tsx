import Image from "next/image";

interface LogoPMDProps {
  size?: number;
  className?: string;
}

const LogoPMD = ({ size = 60, className = "" }: LogoPMDProps) => {
  return (
    <Image
      src="/logo-pmd.png"
      alt="PMD Arquitectura"
      width={size}
      height={size}
      className={`select-none pointer-events-none ${className}`}
      style={{ width: "auto", height: "auto" }}
      priority
    />
  );
};

export default LogoPMD;

