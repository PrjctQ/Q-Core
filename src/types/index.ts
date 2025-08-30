export interface PaginationProps {
    limit?: number;
    offset?: number;
    page?: number;
    sortBy?: number;
    sortOrder?: "asc" | "desc" | 1 | -1;
}
