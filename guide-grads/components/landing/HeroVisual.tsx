import dashSample from "@/components/sample-images/DashSample.png";
import resumeSample from "@/components/sample-images/ResumeSample.png";
import coverLetter from "@/components/sample-images/CoverLetter.png";

/**
 * Hero collage — PNGs in `components/sample-images/`.
 * `--dash-w`, `--dash-top`, `--dash-h`: cover letter is centered on the dashboard’s
 * bottom-right corner (half on / half off horizontally and vertically).
 */
const HERO_IMAGES = {
  resume: resumeSample.src,
  coverLetter: coverLetter.src,
} as const;

const DOC_CARD_W = "w-[min(200px,42vw)]";

const DOC_IMG =
  "block h-full w-full object-contain object-[center_top]";

/** Fills the cover card edge-to-edge (stretch); resume stays `object-contain`. */
const COVER_IMG =
  "absolute inset-0 h-full w-full object-fill object-center";

const RESUME_CARD = `h-[200px] ${DOC_CARD_W} overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10`;

const COVER_CARD = `${DOC_CARD_W} h-[132px] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10`;

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl md:max-w-none">
      <div
        className="relative h-[380px] w-full md:h-[420px] [--dash-w:72%] [--dash-top:2rem] [--dash-h:min(280px,72vw)] md:[--dash-top:2.5rem]"
        aria-hidden
      >
        {/* Back layer — dashboard */}
        <div className="absolute left-0 top-[var(--dash-top)] z-0 h-[var(--dash-h)] w-[var(--dash-w)] overflow-hidden rounded-xl bg-slate-950 shadow-2xl ring-1 ring-white/10">
          <img
            src={dashSample.src}
            alt=""
            className="absolute inset-0 h-full w-full object-fill object-center"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        {/* Resume — top-right */}
        <div className={`absolute right-0 top-0 z-10 ${RESUME_CARD}`}>
          <img
            src={HERO_IMAGES.resume}
            alt=""
            className={DOC_IMG}
            decoding="async"
          />
        </div>

        {/* Cover letter — centered on dash bottom-right corner: 50% on dash / 50% past */}
        <div
          className={`absolute left-[var(--dash-w)] top-[calc(var(--dash-top)+var(--dash-h))] z-20 -translate-x-1/2 -translate-y-1/2 ${COVER_CARD}`}
        >
          <img
            src={HERO_IMAGES.coverLetter}
            alt=""
            className={COVER_IMG}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
