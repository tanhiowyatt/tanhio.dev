type BashProps = {
  size: string;
};

const BashIcon = ({ size }: BashProps) => (
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
    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2Z" />
    <path d="M9 11L12 14 15 11" />
    <path d="M9 13L12 16 15 13" />
  </svg>
);

export default BashIcon;