type IconProps = { size?: number; className?: string; title?: string };

function Svg({
 size = 20,
 className,
 title,
 children,
}: IconProps & { children: React.ReactNode }) {
 return (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 className={className}
 role={title ? "img" : "presentation"}
 aria-hidden={title ? undefined : true}
 aria-label={title}
 >
 {title ? <title>{title}</title> : null}
 {children}
 </svg>
 );
}

export function IconMark({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title || "BuySheet"}>
 <rect x="3" y="2" width="18" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
 <path d="M7 7h10M7 11h10M7 15h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 <circle cx="17" cy="15" r="2.25" fill="currentColor" />
 </Svg>
 );
}

export function IconPlus({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 </Svg>
 );
}

export function IconPhone({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <rect x="7" y="2.5" width="10" height="19" rx="2" stroke="currentColor" strokeWidth="1.75" />
 <path d="M10 18.5h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 </Svg>
 );
}

export function IconLaptop({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <rect x="4" y="4" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
 <path d="M2.5 18.5h19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 </Svg>
 );
}

export function IconTablet({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <rect x="5" y="2.5" width="14" height="19" rx="2" stroke="currentColor" strokeWidth="1.75" />
 <circle cx="12" cy="17.5" r="1" fill="currentColor" />
 </Svg>
 );
}

export function IconBattery({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <rect x="2" y="7" width="17" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
 <path d="M20.5 10v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 <rect x="4.5" y="9.25" width="9" height="5.5" rx="0.75" fill="currentColor" />
 </Svg>
 );
}

export function IconWarn({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <path
 d="M12 3.5 21 19.5H3L12 3.5Z"
 stroke="currentColor"
 strokeWidth="1.75"
 strokeLinejoin="round"
 />
 <path d="M12 9v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 <circle cx="12" cy="16.5" r="1" fill="currentColor" />
 </Svg>
 );
}

export function IconCheck({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
 <path d="M8.5 12.2 11 14.7 15.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
 </Svg>
 );
}

export function IconX({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
 <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 </Svg>
 );
}

export function IconRupee({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <path
 d="M7 6h10M7 10h10M8.5 6c3.5 0 5.5 2 5.5 4.5S12 15 8.5 15H7l7 4"
 stroke="currentColor"
 strokeWidth="1.75"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </Svg>
 );
}

export function IconArrow({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
 </Svg>
 );
}

export function IconBack({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
 </Svg>
 );
}

export function IconShelf({ size, className, title }: IconProps) {
 return (
 <Svg size={size} className={className} title={title}>
 <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 <path d="M6 7v10M18 7v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
 </Svg>
 );
}
