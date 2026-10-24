import type { Metadata } from "next";
import Link from "next/link";
import DiningExplorer from "@/components/DiningExplorer";
import SiteEnhancements from "@/components/SiteEnhancements";
import { loadDining } from "@/lib/dining/load";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Đi ăn | ${APP_NAME}`,
  description: "Một cuốn sổ nhỏ lưu lại những quán ăn và nơi mình muốn nhớ cùng nhau.",
};

// Let edits in the published sheet appear after revalidation without redeploying.
export const revalidate = 120;

export default async function DiningPage() {
  const { places, error } = await loadDining();
  return <>
    <a className="skip-link" href="#main">Bỏ qua điều hướng</a>
    <SiteEnhancements />
    <div className="grain" aria-hidden="true"/><div className="vignette" aria-hidden="true"/>
    <nav className="nav-shell" aria-label="Điều hướng chính">
      <Link className="brand" href="/"><span className="brand-mark">♡</span> {APP_NAME}</Link>
      <div className="nav-pages" aria-label="Hai trang chính"><Link href="/">Kỷ niệm</Link><Link className="is-active" href="/di-an" aria-current="page">Đi ăn <span aria-hidden="true">✳</span></Link></div>
      <a className="nav-date" href="#locations">FOOD DIARY <span>↗</span></a>
    </nav>
    <main id="main" className="dining-page">
      <header className="dining-hero"><div className="dining-hero-copy"><p className="eyebrow">VOL. 02 — A LITTLE TASTE OF US <span>✳</span></p><h1>Hôm nay<br/><em>mình ăn gì?</em></h1><p>Mỗi hàng quán là một cuộc hẹn nhỏ. Mỗi món ngon là một câu chuyện mà mình muốn kể lại, thật lâu về sau.</p><a href="#locations" className="button button-dark">MỞ SỔ TAY <span aria-hidden="true">↘</span></a><div className="dining-hero-foot">MADE OF LITTLE DATES, AND BIG FEELINGS.</div></div>
      <div className="dining-hero-art" aria-hidden="true"><div className="dining-hero-circle"><span>♡</span><strong>GOOD FOOD<br/>GOOD COMPANY</strong><small>✳ OUR PLACES ✳</small></div><span className="dining-hero-orbit orbit-one">01 / ăn ngon</span><span className="dining-hero-orbit orbit-two">02 / bên nhau</span><span className="dining-hero-asterisk">✳</span></div></header>
      <div className="dining-intro"><span>THE PLACES WE LOVE</span><p>Những nơi từng ghé, những món từng thử — tất cả ở đây, theo từng thành phố và góc phố.</p><span aria-hidden="true">♡</span></div>
      <section className="dining-content section-shell" id="locations"><div className="section-heading"><div><p className="eyebrow">A LITTLE FOOD JOURNAL <span>✳</span></p><h2>Đi một nơi,<br/><em>nhớ một đời.</em></h2></div><p className="section-aside">Một bản đồ nho nhỏ của hai đứa, gom lại từ những quán ăn và điều dễ thương.</p></div>
      {error && <div className="dining-error" role="status"><strong>Chưa kết nối được Google Sheets.</strong><p>{error}</p></div>}
      <DiningExplorer places={places} /></section>
    </main>
    <footer className="footer"><Link className="brand" href="/"><span className="brand-mark">♡</span> {APP_NAME}</Link><p>Love tastes better when shared.</p><a href="#main" className="back-top">VỀ ĐẦU TRANG ↑</a><div className="footer-bottom"><span>OUR LITTLE FOOD JOURNAL</span><span>ONE MORE DATE, ONE MORE MEMORY ♡</span><span>© JUST US</span></div></footer>
  </>;
}
