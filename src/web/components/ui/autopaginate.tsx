import { SetStateAction } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./pagination";

export default function AutoPaginate({
    page,
    pages,
    setPage,
    update,
}: {
    page: number;
    pages: number;
    setPage: (value: SetStateAction<number>) => void;
    update?: (page: number) => unknown;
}) {
    const show: (number | null)[] = [];

    if (page >= 3) show.push(1);

    if (page > 4) show.push(null);
    else if (page === 4) show.push(2);

    show.push(...[...new Array(3).keys()].map((n) => page + n - 1).filter((n) => n >= 1 && n <= pages));

    if (page < pages - 3) show.push(null);
    else if (page === pages - 3) show.push(pages - 1);

    if (page <= pages - 2) show.push(pages);

    return (
        <Pagination>
            <PaginationContent className="cursor-pointer">
                {page === 1 ? null : (
                    <PaginationItem>
                        <PaginationPrevious onClick={() => setPage((x) => (update?.(x - 1), x - 1))} />
                    </PaginationItem>
                )}
                {show.map((n, i) => (
                    <PaginationItem key={i}>
                        {n === null ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                onClick={() => {
                                    if (page === n) return;
                                    update?.(n);
                                    setPage(n);
                                }}
                                isActive={page === n}
                            >
                                {n}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                {page === pages ? null : (
                    <PaginationItem>
                        <PaginationNext onClick={() => setPage((x) => (update?.(x + 1), x + 1))} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}
