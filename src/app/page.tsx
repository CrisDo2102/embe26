import Link from "next/link";
import LittleThings from "@/components/LittleThings";
import AnniversaryCounter from "@/components/AnniversaryCounter";
import Gallery from "@/components/Gallery";
import LoveLetter from "@/components/LoveLetter";
import MemoryExplorer from "@/components/MemoryExplorer";
import MemoryKeepsake from "@/components/MemoryKeepsake";
import MusicPlayer from "@/components/MusicPlayer";
import Reveal from "@/components/Reveal";
import SafeImage from "@/components/SafeImage";
import SiteEnhancements from "@/components/SiteEnhancements";
import { cover, memories } from "@/data/memories";
import { memoryService } from "@/domain/memories/service";
import { APP_NAME } from "@/lib/constants";

/**
 * Server Component. Everything static (copy, timeline, letter, hero) ships as plain HTML;
 * client JavaScript is limited to the interactive islands (explorer, gallery, keepsakes, player, motion).
 */
export default async function HomePage() {
  const [initialMemories, categories] = await Promise.all([memoryService.list(), memoryService.categories()]);

  return (
    <>
      <a className="skip-link" href="#main">Bỏ qua điều hướng</a>
      <SiteEnhancements />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="ambient-hearts" aria-hidden="true">
        <span>♡</span><span>♡</span><span>♡</span><span>♡</span><span>♡</span>
      </div>
      <nav className="nav-shell" aria-label="Điều hướng chính">
        <a className="brand" href="#top"><span className="brand-mark">♡</span> {APP_NAME}</a>
        <div className="nav-pages" aria-label="Hai trang chính"><Link className="is-active" href="/" aria-current="page">Kỷ niệm <span aria-hidden="true">♡</span></Link><Link href="/di-an">Đi ăn</Link></div>
        <div className="nav-links">
          <a href="#story">Our story</a>
          <a href="#gallery">Memories</a>
          <a href="#letter">A letter</a>
          <a href="#find-memory">Find a memory</a>
          <a href="#keepsake">Keepsakes</a>
          <a href="#little-things">Little things</a>
        </div>
        <a className="nav-date" href="#letter">MADE WITH LOVE <span>↗</span></a>
      </nav>
      <main id="main">
        <header className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow hero-in hero-in-1">A LITTLE WEBSITE, JUST FOR YOU <span>✳</span></p>
            <h1 className="hero-in hero-in-2">To my favorite<br /><em>person.</em></h1>
            <p className="hero-description hero-in hero-in-3">Một góc nhỏ của thế giới này, nơi anh cất những điều dễ thương về em — và về tụi mình.</p>
            <div className="hero-actions hero-in hero-in-4">
              <a className="button button-dark" href="#story">Đi vào câu chuyện <span>↘</span></a>
              <span className="handwritten">psst... this is yours ♡</span>
            </div>
            <div className="hero-foot"><span>VOL. 01 — THE STORY OF US</span><span>SCROLL TO EXPLORE ↓</span></div>
          </div>
          <div className="hero-art hero-in hero-in-art">
            <div className="hero-photo-frame">
              <SafeImage src={cover.src} width={cover.width} height={cover.height} alt={cover.alt} preload fetchPriority="high" sizes="(max-width: 620px) 90vw, 440px" />
              <div className="photo-label"><span>THE WAY I SEE YOU</span><span>♡ 001</span></div>
            </div>
            <span className="art-note note-one">my happy place</span>
            <span className="art-note note-two">you + me, always</span>
            <span className="art-sparkle">✳</span>
            <span className="art-circle">A LOVE<br />NOTE<br />FOR YOU</span>
          </div>
        </header>
        <LittleThings />
        <section className="intro-strip">
          <span>01 / A SMALL INTRODUCTION</span>
          <p>Không phải món quà lớn nhất, chỉ là một điều nhỏ anh làm bằng tất cả sự thương mến.</p>
          <span className="intro-heart">♡</span>
        </section>
        <section className="story-section section-shell" id="story">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CHAPTERS OF US <span>✳</span></p>
              <h2>Little moments,<br /><em>big feelings.</em></h2>
            </div>
            <p className="section-aside">Có những ngày trôi qua rất bình thường, nhưng khi ở cạnh đúng người, tự nhiên lại muốn nhớ mãi.</p>
          </div>
          <div className="timeline">
            {memories.map((item, i) => (
              <Reveal key={item.id} as="article" className="timeline-item" delay={i * 0.08} duration={0.45} amount={0.3}>
                <div className="timeline-marker">{String(i + 1).padStart(2, "0")}</div>
                <div className="timeline-content">
                  <span className="eyebrow">{item.date}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span className="timeline-heart">♡</span>
              </Reveal>
            ))}
          </div>
          <AnniversaryCounter />
        </section>
        <section className="explorer-section section-shell" id="find-memory">
          <MemoryExplorer initialItems={initialMemories} categories={categories} />
        </section>
        <section className="gallery-section" id="gallery">
          <div className="section-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE CAMERA ROLL <span>✳</span></p>
                <h2>Proof that we<br /><em>were here.</em></h2>
              </div>
              <p className="section-aside">Một vài mảnh ghép nhỏ anh muốn giữ lại. Bấm vào từng tấm để nhìn gần hơn nhé.</p>
            </div>
            <Gallery />
            <p className="gallery-footnote">A FEW OF MY FAVORITE FRAMES <span>✳</span></p>
          </div>
        </section>
        <section className="letter-section section-shell" id="letter">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SOMETHING FROM THE HEART <span>✳</span></p>
              <h2>Read this when<br /><em>you need a hug.</em></h2>
            </div>
            <p className="section-aside">Không phải lúc nào anh cũng giỏi nói ra những điều trong lòng. Nên anh viết chúng ở đây, để em có thể đọc bất cứ khi nào muốn.</p>
          </div>
          <div className="letter-layout">
            <LoveLetter />
            <aside className="letter-aside">
              <span className="aside-flower">✳</span>
              <p>{"“In a room full of art, I'd still stare at you.”"}</p>
              <span className="aside-caption">— A THOUGHT I KEEP</span>
              <div className="aside-doodle">♡</div>
              <MusicPlayer />
            </aside>
          </div>
        </section>
        <section className="keepsake-section section-shell" id="keepsake">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A PLACE FOR TOMORROW <span>✳</span></p>
              <h2>Keep the little<br /><em>things, too.</em></h2>
            </div>
            <p className="section-aside">Không chỉ là những gì đã qua. Đây còn là nơi mình cất lại những điều muốn nhớ trong những ngày sắp tới.</p>
          </div>
          <MemoryKeepsake />
        </section>
      </main>
      <footer className="footer">
        <a className="brand" href="#top"><span className="brand-mark">♡</span> {APP_NAME}</a>
        <p>Made slowly, with a lot of love.</p>
        <a href="#top" className="back-top">BACK TO TOP ↑</a>
        <div className="footer-bottom">
          <span>FOR MY FAVORITE PERSON</span>
          <span>AND THE STORY IS STILL GOING… ♡</span>
          <span>© JUST US</span>
        </div>
      </footer>
    </>
  );
}
