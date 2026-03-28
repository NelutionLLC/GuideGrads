export default function WaveDivider() {
    return (
      <div className="relative">
        {/* White wave that cuts into the navy section */}
        <svg
          className="block w-full"
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C240,120 480,120 720,80 C960,40 1200,40 1440,72 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    );
  }
  