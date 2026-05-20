

export interface Author {
    name: string;
    email: string
}

export interface Blog {
    id: number;
    title: string;
    description?: string;
    author: Author | string;
    date_published: Date;
    date_updated: Date;
}