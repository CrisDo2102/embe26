import Link from "next/link";
export default function NotFound() {
  return <main className="route-state">
    <span className="route-state-flower" aria-hidden="true">♡</span>
    <p className="eyebrow">A PAGE THAT WANDERED OFF</p>
    <h1>Trang này đi lạc mất rồi.</h1>
    <p>Không sao cả. Mình quay lại nơi câu chuyện bắt đầu nhé.</p>
    <Link className="button button-dark" href="/">Về trang chính <span>↗</span></Link>
  </main>;
}
