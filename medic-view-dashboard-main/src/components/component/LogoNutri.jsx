export default function LogoNutri({ size = 128, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="title"
      className={className}
    >
      <title>Logo Nutrition & Entraînement</title>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="rgba(253, 249, 249, 0.18)" />
          <stop offset="100%" stopColor="rgba(253, 249, 249, 0)" />
        </radialGradient>
      </defs>
      <rect x="32" y="32" width="960" height="960" rx="220" fill="url(#g)" />
      <rect x="32" y="32" width="960" height="960" rx="220" fill="url(#glow)" />
      <g fill="#f2f4f7ff">
        <path d="M558 268c62-7 113 25 113 82 0 64-50 108-157 121 19-76 28-142 44-171z" />
        <path d="M512 812c-148 0-266-136-266-278 0-103 70-173 166-173 53 0 94 20 122 51 28-31 69-51 122-51 96 0 166 70 166 173 0 142-118 278-266 278-26 0-50-4-74-4s-48 4-70 4z" />
        <path d="M365 688c-3-104 66-166 160-184-6 89-32 161-113 218-15 11-31-8-47-34z" />
        <path d="M662 688c-16 26-32 45-47 34-81-57-107-129-113-218 94 18 163 80 160 184z" />
      </g>
    </svg>
  );
}
