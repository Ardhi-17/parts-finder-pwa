import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="rounded-2xl border border-gray-200 bg-white p-3 text-xs shadow-sm">
      <div className="flex flex-wrap items-center gap-1 text-gray-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-semibold text-gray-700 underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-bold text-gray-900" : "font-semibold"}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? <span>/</span> : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}