type PythonProps = {
  size: string;
};

const PythonIcon = ({ size }: PythonProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L15 8H9L12 2Z" />
    <path d="M9 8V16" />
    <path d="M15 8V16" />
    <path d="M6 16H18" />
    <path d="M8 20H16" />
  </svg>
);

export default PythonIcon;