

export interface ObAccumulator {
    authors: string[],
    categories: string[],
    tags: string[]
}

export interface IdObject {
  id: string;
}

export interface BlogDetails {
    id: string;
    author: IdObject;
    category: IdObject;
    tags: IdObject[];
}

export interface BlogInteraction {
  id: string;
  blog: BlogDetails;
}


export const blogInteractionTypes = Object.freeze({
    COMMENT: 'comment',
    LIKE: "like",
    BOOKMARK: "bookMark"
})