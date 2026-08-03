import Link from "next/link";
import { IconPlus, IconShelf } from "./Icons";

export function Shell({
 children,
 masthead = "BUY SHEET",
}: {
 children: React.ReactNode;
 masthead?: string;
}) {
 return (
 <div className="counter">
 <div className="counter-grain" aria-hidden />
 <div className="sheet">
 <header className="sheet-head">
 <div className="reg-marks" aria-hidden>
 <span />
 <span />
 <span />
 <span />
 </div>
 <Link href="/" className="masthead">
 <span className="masthead-stamp">{masthead}</span>
 <span className="masthead-meta">
 used device purchase form BS-03
 <br />
 max 15 min at counter
 </span>
 </Link>
 <nav className="sheet-nav">
 <Link href="/" className="ink-link">
 <IconShelf size={15} />
 Ledger
 </Link>
 <Link href="/owner" className="ink-link">
 Owner
 </Link>
 <Link href="/intake" className="stamp-btn">
 <IconPlus size={15} />
 New sheet
 </Link>
 </nav>
 </header>
 <div className="perforation" aria-hidden />
 <main className="sheet-body">{children}</main>
 <footer className="sheet-foot">
 <span>Keep with device until sold</span>
 <span>Duplicate carbon to owner drawer</span>
 </footer>
 </div>
 </div>
 );
}
