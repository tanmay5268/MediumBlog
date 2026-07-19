const Navbar = () => {
  return (
    <div className="h-full w-full py-2 border-b-2 border-[#6F4E37]">
          <nav className="flex justify-between items-center  md:mx-auto md:max-w-[75rem] h-full">
              <div className=" max-sm:ml-2  flex max-sm:text-[2.1rem]  text-shadow-2xs text-5xl w-1/3 font-[family-name:var(--font-story-script)]">CodeLore</div>
              <div className="flex items-center  gap-10 justify-end mx-2  w-2/3">
                  <div className="h-10 max-sm:hidden p-2 font-[family-name:var(--font-geist-mono)]">Write</div>
                  <div className="h-10 max-sm:hidden p-2 font-[family-name:var(--font-geist-mono)]">Signin</div>
                  <button className="h-10 font-[family-name:var(--font-geist-mono)]   bg-[#191919] text-[#fffff5] flex items-center justify-center-safe rounded-4xl p-3">Get started</button>
              </div>
        </nav>
    </div>
  );
};

export default Navbar;
