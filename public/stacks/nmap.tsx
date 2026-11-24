type NmapProps = {
  size: string;
};

const NmapIcon = ({ size }: NmapProps) => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6V12L16 14" />
    <path d="M8 14H4" />
    <path d="M16 14H20" />
  </svg>
);

export default NmapIcon;