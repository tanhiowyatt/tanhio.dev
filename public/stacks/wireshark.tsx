type WiresharkProps = {
  size: string;
};

const WiresharkIcon = ({ size }: WiresharkProps) => (
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
    <path d="M21 12.79A9 9 0 1 1 9.21 3 7 7 0 0 0 12 12v4" />
    <path d="M12 16V20" />
    <path d="M8 20H16" />
    <path d="M12 10H8" />
    <path d="M12 14H8" />
  </svg>
);

export default WiresharkIcon;