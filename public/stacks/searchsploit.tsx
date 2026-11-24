type SearchsploitProps = {
  size: string;
};

const SearchsploitIcon = ({ size }: SearchsploitProps) => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21L16.65 16.65" />
    <path d="M11 8V11H14" />
  </svg>
);

export default SearchsploitIcon;