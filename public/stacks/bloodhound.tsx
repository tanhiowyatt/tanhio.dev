type BloodhoundProps = {
  size: string;
};

const BloodhoundIcon = ({ size }: BloodhoundProps) => (
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
    <path d="M12 2L2 7l10 5 10-5-10-5Z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <path d="M8 10L12 14L16 10" />
    <path d="M12 14V20" />
  </svg>
);

export default BloodhoundIcon;