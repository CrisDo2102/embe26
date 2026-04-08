const siteData = {
  loverName: "Bé Yêu",
  yourName: "Anh",
  birthdayDate: "2026-04-09T00:00:00",
  heroTitle: "Happy Birthday, Cục Dàng của anh 💖",
  heroSubtitle:
    "Một chiếc web nhỏ nhưng chứa rất nhiều điều anh muốn dành riêng cho em trong ngày đặc biệt nhất.",
  loveQuote:
    "Trong rất nhiều điều đẹp đẽ trên thế giới này, em là điều đẹp đẽ nhất đến với anh.",
  // Dat anh va nhac cua ban vao dung folder sau:
  // - assets/images/cover.jpg
  // - assets/images/photo-1.jpg -> photo-4.jpg
  // - assets/music/birthday-song.mp3
  musicUrl: "assets/music/birthday-song.mp3",
  coverImage: "assets/images/cover.jpg",
  letterTitle: "Một bức thư thật ngọt dành riêng cho em bé",
  letter:
    "Chúc mừng sinh nhật em pé, cô gái mà anh thương rất nhiều. Anh cảm ơn vì em iu đã xuất hiện, vì đã mang đến cho anh iu thật nhiều cảm xúc đẹp, những niềm vui nhỏ xinh và cả cảm giác được yêu thương rất chân thành. Anh mong tuổi mới sẽ dịu dàng với em nhỏ, mang đến cho chị nhà thật nhiều sức khỏe, hạnh phúc, may mắn và những điều em đang ấp ủ. Anh mong em pé luôn cười thật nhiều, luôn tin vào bản thân mình và luôn có những người yêu thương em ở bên cạnh. Còn với anh, điều anh mong nhất là được tiếp tục cùng em đi qua thêm nhiều kỷ niệm đẹp nữa. Dù hôm nay, ngày mai hay rất lâu về sau, anh vẫn muốn nói rằng: cảm ơn em bé vì đã là em bé. Và anh thật sự rất thương bé nhà mình.",
  reasons: [
    "Vì em pé luôn khiến anh muốn trở thành phiên bản tốt hơn của chính mình.",
    "Vì em nhỏ có một nụ cười rất đẹp, kiểu nhìn thấy là tự nhiên thấy lòng dịu lại.",
    "Vì em bé là người có thể biến một ngày bình thường thành một ngày đáng nhớ.",
    "Vì ở bên cục dàng, anh thấy bình yên, ấm áp và được là chính mình.",
    "Vì tục tưng rất đặc biệt, theo cách mà không ai có thể thay thế.",
    "Vì yêu tục dàng không phải là cố gắng, mà là điều đến rất tự nhiên."
  ],
  sweetMessages: [
    "Nếu hôm nay chị nhà cười thật nhiều, vậy là món quà này đã thành công ròi.",
    "Em không cần hoàn hảo, vì với anh em đã là điều rất đáng yêu rồi.",
    "Chúc em tuổi mới vừa hạnh phúc, vừa xinh đẹp, vừa gặp toàn điều tốt lành.",
    "Hy vọng sau này mỗi sinh nhật của em, anh vẫn có mặt trong những điều đẹp đẽ ấy."
  ],
  timeline: [
    {
      date: "Lần đầu gặp nhau",
      title: "Ngày mọi thứ bắt đầu",
      description:
        "Có thể chỉ là một khoảnh khắc rất bình thường với thế giới, nhưng với anh của em bé đó là thời điểm một người rất đặc biệt bước vào cuộc sống của anh hẹ hẹ."
    },
    {
      date: "Buổi hẹn đầu tiên",
      title: "Ngày anh bắt đầu nhớ tục tưng nhiều hơn",
      description:
        "Từ cuộc trò chuyện ấy, anh nhận ra ở bên em nhỏ rất dễ chịu. Mọi điều bình thường cũng trở nên đáng nhớ hơn."
    },
    {
      date: "Khoảnh khắc anh rung động",
      title: "Ngày anh biết em quan trọng",
      description:
        "Có lẽ là lúc em pé cười, hoặc lúc em quan tâm một điều rất nhỏ. Anh họng nhớ chính xác khoảnh khắc nào, chỉ nhớ là từ đó anh thương em thật nhiều."
    },
    {
      date: "Sinh nhật của em",
      title: "Ngày anh muốn làm em hạnh phúc",
      description:
        "Và hôm nay, anh chỉ mong em iu mỉm cười thật nhiều, nhận ra mình được yêu thương nhiều đến thế nào, và có một ngày sinh nhật thật trọn vẹn."
    }
  ],
  gallery: [
    {
      title: "Em bé nháy mắt nè",
      note: "Cục dàng nháy máy nữa ikk.",
      image:
        "assets/images/photo-1.jpg"
    },
    {
      title: "Em bé chu mỏ kìa",
      note: "Em bé cụa anhhhhh áaa.",
      image:
        "assets/images/photo-2.jpg"
    },
    {
      title: "Em bé đeo khẩu trang",
      note: "Em bé đeo khẩu trang họng có dễ thw đâu em bé.",
      image:
        "assets/images/photo-3.jpg"
    },
    {
      title: "Em bé tựa vào anh nè",
      note: "Lần đi đà lạt đầu tiên với em bé hehe.",
      image:
        "assets/images/photo-4.jpg"
    }
  ],
  playlist: [
  ]
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatBirthdayBadge() {
  const date = new Date(siteData.birthdayDate);
  if (Number.isNaN(date.getTime())) return "Ngày đặc biệt của em";
  return `Sinh nhật: ${date.toLocaleDateString("vi-VN")}`;
}

function renderBaseContent() {
  setText("heroTitle", siteData.heroTitle);
  setText("heroSubtitle", siteData.heroSubtitle);
  setText("loveQuote", `“${siteData.loveQuote}”`);
  setText("musicName", siteData.musicName);
  setText("letterTitle", siteData.letterTitle);
  setText("letterText", siteData.letter);
  setText("signature", `— ${siteData.yourName}`);
  setText("footerFrom", `Made with love by ${siteData.yourName}`);
  setText("footerWish", `Happy Birthday ${siteData.loverName}`);
  setText("forName", siteData.loverName);
  setText("fromName", siteData.yourName);
  setText("birthdayBadge", formatBirthdayBadge());

  const coverImage = document.getElementById("coverImage");
  if (coverImage) coverImage.src = siteData.coverImage;

  const musicSource = document.getElementById("musicSource");
  const audio = document.getElementById("bgMusic");
  if (musicSource && audio) {
    musicSource.src = siteData.musicUrl;
    audio.load();
  }
}

function renderTimeline() {
  const timelineList = document.getElementById("timelineList");
  timelineList.innerHTML = siteData.timeline
    .map(
      (item, index) => `
        <div class="timeline-item reveal ${index % 2 ? "delay-1" : ""}">
          <div class="timeline-date">${item.date}</div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </div>
      `
    )
    .join("");
}

function renderGallery() {
  const galleryList = document.getElementById("galleryList");
  galleryList.innerHTML = siteData.gallery
    .map(
      (item, index) => `
        <article class="gallery-card reveal ${index % 2 ? "delay-1" : ""}">
          <img src="${item.image}" alt="${item.title}" />
          <div class="content">
            <h3>${item.title}</h3>
            <p>${item.note}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderReasons() {
  const reasonList = document.getElementById("reasonList");
  reasonList.innerHTML = siteData.reasons
    .map((item, index) => `<div class="reason-item reveal ${index * 0.04 > 0.1 ? "delay-1" : ""}">💗 ${item}</div>`)
    .join("");
}

function renderSweetMessages() {
  const sweetList = document.getElementById("sweetList");
  sweetList.innerHTML = siteData.sweetMessages
    .map((item, index) => `<div class="sweet-item reveal ${index % 2 ? "delay-1" : ""}">${item}</div>`)
    .join("");
}

function renderPlaylist() {
  const playlistList = document.getElementById("playlistList");
  playlistList.innerHTML = siteData.playlist
    .map(
      (item, index) => `
        <article class="playlist-card reveal ${index % 2 ? "delay-1" : ""}">
          <div class="play-number">${String(index + 1).padStart(2, "0")}</div>
          <div class="play-info">
            <h3>${item}</h3>
            <p>Bản nhạc nên nghe cùng nhau</p>
          </div>
        </article>
      `
    )
    .join("");
}

function setupCountdown() {
  const ids = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  function updateCountdown() {
    const target = new Date(siteData.birthdayDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (Number.isNaN(target) || diff <= 0) {
      Object.values(ids).forEach((el) => {
        if (el) el.textContent = "00";
      });
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    ids.days.textContent = String(days).padStart(2, "0");
    ids.hours.textContent = String(hours).padStart(2, "0");
    ids.minutes.textContent = String(minutes).padStart(2, "0");
    ids.seconds.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function setupMusic() {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicToggle");
  let isPlaying = false;

  button.addEventListener("click", async () => {
    try {
      if (!isPlaying) {
        await audio.play();
        button.textContent = "Tạm dừng nhạc";
        isPlaying = true;
      } else {
        audio.pause();
        button.textContent = "Bật nhạc";
        isPlaying = false;
      }
    } catch (error) {
      alert("Trình duyệt đang chặn phát nhạc tự động. Bạn bấm lại một lần nữa nhé.");
    }
  });

  audio.addEventListener("ended", () => {
    button.textContent = "Bật nhạc";
    isPlaying = false;
  });

  audio.addEventListener("error", () => {
    button.textContent = "Chưa có file nhạc";
    isPlaying = false;
  });
}

function createHearts() {
  const container = document.querySelector(".floating-hearts");
  if (!container) return;

  const hearts = ["♥", "❤", "♡"];

  for (let i = 0; i < 18; i += 1) {
    const span = document.createElement("span");
    span.textContent = hearts[i % hearts.length];
    span.style.left = `${Math.random() * 100}%`;
    span.style.fontSize = `${18 + Math.random() * 20}px`;
    span.style.animationDuration = `${7 + Math.random() * 6}s`;
    span.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(span);
  }
}

function setupReveal() {
  const revealItems = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

renderBaseContent();
renderTimeline();
renderGallery();
renderReasons();
renderSweetMessages();
renderPlaylist();
setupCountdown();
setupMusic();
createHearts();
setupReveal();
