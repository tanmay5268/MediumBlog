import { WordRotate } from "@/components/ui/word-rotate"
const Hero = () => {
  return (
    <div id="hero" className=" pt-15 pb-10 h-content w-full">
      <div className="md:mx-auto md:max-w-[75rem] h-full">
        <div className=" text-8xl max-sm:text-[3.8rem] max-sm:mx-4 flex flex-col justify-between h-full">
          <div className=" font-[family-name:var(--font-story-script)]">
            Read
          </div>
          <div className=" font-[family-name:var(--font-story-script)]">
            Write
          </div>
          <div className="font-[family-name:var(--font-story-script)] flex flex-col sm:flex-row sm:items-baseline sm:gap-x-4">
            <span>Share</span>
            <WordRotate words={["Knowledge", "Experience","thoughts"]} />
            <span className="max-sm:hidden">. .</span>
          </div>
          <div className="text-xl max-sm:text-lg mt-7 font-[family-name:var(--font-geist-mono)]">
            The modern publishing platform for developers,
            designers <br />and curious minds.
          </div>
          <button
            type="button"
            className="h-10 cursor-pointer mt-10 max-sm:mt-5 font-[family-name:var(--font-story-script)] w-45   bg-[#191919] text-[#fffff5] text-[20px] flex items-center justify-center-safe rounded-4xl p-3"
          >
            Start reading
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
