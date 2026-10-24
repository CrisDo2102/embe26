import type { MemoryRecord } from "@/domain/memories/types";

/**
 * Editable content. Everything the page, the API and the search read comes from here.
 * Keep wording in Vietnamese with full diacritics; the search handles accents for you.
 */

export type Photo = {
  src: string;
  /** Intrinsic pixel size. Lets the browser reserve space (no layout shift) and next/image pick sizes. */
  width: number;
  height: number;
  title: string;
  note: string;
  /** Describe what is in the picture for screen readers. Falls back to `title` when omitted. */
  alt?: string;
};

export const cover = {
  src: "/assets/images/cover.jpg",
  width: 2560,
  height: 1706,
  alt: "Bìa album kỷ niệm của tụi mình",
} as const;

/**
 * Valid categories: "dates" | "everyday" | "trips". A category with no records is hidden from the
 * filter automatically, so "trips" appears once you add a memory that uses it.
 */
export const memories: readonly MemoryRecord[] = [
  {
    id: "memory-1",
    date: "CHƯƠNG 01",
    title: "Ngày mọi thứ bắt đầu",
    description: "Có thể chỉ là một khoảnh khắc bình thường với thế giới, nhưng với anh, đó là lúc một người rất đặc biệt bước vào cuộc sống.",
    category: "everyday",
    tags: ["tụi mình", "kỷ niệm"],
  },
  {
    id: "memory-2",
    date: "CHƯƠNG 02",
    title: "Buổi hẹn đầu tiên",
    description: "Từ những câu chuyện nhỏ, anh nhận ra ở bên em thật dễ chịu. Mọi điều bình thường cũng trở nên đáng nhớ hơn.",
    category: "dates",
    tags: ["hẹn hò", "bắt đầu"],
  },
  {
    id: "memory-3",
    date: "CHƯƠNG 03",
    title: "Ngày anh biết em quan trọng",
    description: "Anh không nhớ chính xác khoảnh khắc nào. Anh chỉ nhớ từ đó, anh muốn kể em nghe nhiều điều hơn và thương em nhiều hơn.",
    category: "everyday",
    tags: ["tụi mình", "kỷ niệm"],
  },
  {
    id: "memory-4",
    date: "CHƯƠNG 04",
    title: "Còn nhiều chương ở phía trước",
    description: "Mong tụi mình tiếp tục cùng nhau đi qua thật nhiều ngày bình thường mà sau này nhớ lại vẫn thấy quý giá.",
    category: "everyday",
    tags: ["tụi mình", "kỷ niệm"],
  },
];

export const photos: readonly Photo[] = [
  { src: "/assets/images/photo-1.jpg", width: 1284, height: 2778, title: "Một chiếc em bé đáng yêu", note: "Khoảnh khắc anh muốn cất giữ." },
  { src: "/assets/images/photo-2.jpg", width: 1284, height: 2778, title: "Nhìn là thấy thương", note: "Một tấm hình, rất nhiều cảm xúc." },
  { src: "/assets/images/photo-3.jpg", width: 1020, height: 1020, title: "Ngày hôm ấy", note: "Mong sau này mình có thêm thật nhiều tấm như này." },
  { src: "/assets/images/photo-4.jpg", width: 1020, height: 1020, title: "Bé nhà mình", note: "Tấm hình nhỏ trong chiếc hộp kỷ niệm lớn." },
];

export const reasons: readonly string[] = [
  "Vì em luôn khiến anh muốn trở thành phiên bản tốt hơn của chính mình.",
  "Vì nụ cười của em có cách làm một ngày dài dịu lại.",
  "Vì em có thể biến một ngày bình thường thành một ngày đáng nhớ.",
  "Vì ở bên em, anh thấy bình yên và được là chính mình.",
  "Vì em đặc biệt theo cách không ai có thể thay thế.",
  "Vì thương em là điều đến với anh rất tự nhiên.",
];

export const littleNotes: readonly string[] = [
  "Nếu hôm nay em cười thật nhiều, món quà này đã thành công rồi.",
  "Em không cần hoàn hảo, vì trong mắt anh em đã rất đáng yêu.",
  "Mong tuổi mới dịu dàng với em, và những điều em ấp ủ đều dần thành hiện thực.",
  "Hy vọng những sinh nhật sau, anh vẫn được góp mặt trong những điều đẹp đẽ của em.",
];
