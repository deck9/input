type PaginateLink = {
    url: string;
    label: string;
    active: boolean;
};

interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: PaginateLink[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
