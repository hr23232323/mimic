/**
 * Custom Ghost Icon for Mimic
 * A friendly ghost that represents the "invisible developer"
 */

interface GhostIconProps {
  className?: string;
}

export function GhostIcon({ className = "w-6 h-6" }: GhostIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ghost body */}
      <path
        d="M12 2C8.5 2 6 4.5 6 8V18C6 18 6.5 17 7.5 17C8.5 17 9 18 10 18C11 18 11.5 17 12.5 17C13.5 17 14 18 15 18C16 18 16.5 17 17.5 17C18.5 17 19 18 19 18V8C19 4.5 15.5 2 12 2Z"
        fill="currentColor"
        opacity="0.9"
      />

      {/* Left eye */}
      <circle cx="9.5" cy="9" r="1.5" fill="#18181b" />

      {/* Right eye */}
      <circle cx="14.5" cy="9" r="1.5" fill="#18181b" />

      {/* Mouth (optional smile) */}
      <path
        d="M9 12C9.5 13 10.5 13.5 12 13.5C13.5 13.5 14.5 13 15 12"
        stroke="#18181b"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
