import Reveal from "@/components/Reveal";
import SurpriseNote from "@/components/SurpriseNote";
import { reasons } from "@/data/memories";

/** Server component: the letter and the list are plain HTML; only the surprise button needs JavaScript. */
export default function LoveLetter() {
  return (
    <>
      <section className="letter-paper">
        <div className="letter-top">
          <span>GỬI EM, NGƯỜI ANH THƯƠNG</span>
          <span className="letter-stamp">for you<br />with love</span>
        </div>
        <h3>Một vài điều anh muốn em biết.</h3>
        <p>Chúc mừng sinh nhật em bé, cô gái mà anh thương rất nhiều.</p>
        <p>Anh cảm ơn vì em đã xuất hiện, mang đến cho anh những niềm vui nhỏ xinh và cảm giác được yêu thương thật chân thành. Anh mong tuổi mới sẽ dịu dàng với em, mang đến thật nhiều sức khỏe, hạnh phúc, may mắn và những điều em đang ấp ủ.</p>
        <p>Mong em luôn cười thật nhiều, luôn tin vào bản thân mình. Còn với anh, điều anh mong nhất là được tiếp tục cùng em đi qua thêm nhiều kỷ niệm đẹp nữa.</p>
        <p>Dù hôm nay, ngày mai hay thật lâu về sau, anh vẫn muốn nói: cảm ơn em vì đã là em. Anh thương em nhiều.</p>
        <div className="letter-sign">Thương em,<br /><span>Anh ♡</span></div>
      </section>
      <div className="reasons-block">
        <p className="eyebrow">A LITTLE LIST</p>
        <h3>{reasons.length} điều anh thương ở em</h3>
        <div className="reason-list">
          {reasons.map((reason, i) => (
            <Reveal key={reason} className="reason-row" x={-12} y={0} delay={i * 0.06} amount={0.1}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <p>{reason}</p>
              <span className="reason-heart">♡</span>
            </Reveal>
          ))}
        </div>
      </div>
      <SurpriseNote />
    </>
  );
}
