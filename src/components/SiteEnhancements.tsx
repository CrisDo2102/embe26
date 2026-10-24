import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import QuietMode from "@/components/QuietMode";
import OfflineNotice from "@/components/OfflineNotice";
export default function SiteEnhancements() {
  return <><OfflineNotice /><ReadingProgress /><BackToTop /><div className="quiet-mode-slot"><QuietMode /></div></>;
}
