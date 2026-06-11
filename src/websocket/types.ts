

export interface UserConnection {
    userId: string
}
export interface IncomingEvent {
    event: string,
    payload: Record<string, any>,
    timestamp?: Date
}
export interface OutEvent {
    event: string,
    payload: Record<string, any>,
    serverTimestamp?: Date
}

export const Events = Object.freeze({
    SYNC_REQUEST: "sync_request",
    Like: "like",
    Comment: "comment",
    BookMark: "bookmark",
    NewsLetter: "newsLetter"
})

