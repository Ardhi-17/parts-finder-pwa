import Image from "next/image";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  companyLabel?: string;
  logoSrc?: string;
};

export default function PageHeader({
  title = "Parts Finder",
  subtitle = "Pencarian part service teknisi",
  companyLabel = "Easiest Way To Find Parts",
  logoSrc = "/logo.png",
}: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-[#D6DCE5] bg-white px-4 py-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[#F7C600]" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-36 w-36 rounded-full border-[16px] border-[#F7C600]/20" />
      <div className="pointer-events-none absolute -bottom-10 right-16 h-20 w-20 rounded-full border-[10px] border-[#0B1E3A]/10" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-2 w-2 rounded-full bg-[#F7C600]/50" />

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-br from-[#F7C600] to-[#E6B700]" />
          <div className="relative flex h-[102px] w-[102px] items-center justify-center overflow-hidden rounded-3xl border-2 border-[#0B1E3A] bg-white shadow-[0_8px_18px_rgba(11,30,58,0.16)]">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0B1E3A]" />
            <Image
              src={logoSrc}
              alt="Parts Finder Logo"
              width={88}
              height={88}
              className="h-[88px] w-[88px] object-contain"
              priority
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center rounded-md border border-[#F1C232] bg-[#FFF8D6] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0B1E3A]">
            {companyLabel}
          </span>

          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[#0B1E3A] sm:text-3xl">
            {title}
          </h1>

          <p className="mt-1.5 text-base font-medium leading-snug text-[#334155]">
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}