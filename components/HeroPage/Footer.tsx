const items = [
  { name: "Help", href: "#" },
  { name: "Terms", href: "#" },
  { name: "Github", href: "https://github.com/tanmay5268" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/tanmay5268" },
  { name: "X", href: "https://x.com/tanmay5268" },
];

const Footer = () => {
  return (
    <footer className="w-full  border-t border-[#6F4E37]/40 bg-[#fffff5]">
      <div className="mx-auto flex max-w-[75rem] flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6">
        {items.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="font-[family-name:var(--font-geist-mono)] text-sm text-[#191919]/70 transition-opacity hover:opacity-100"
          >
            {item.name}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
