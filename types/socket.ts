export interface ServerToClientEvents {
    ac: (data: { items: Array<string>, transaction: number }) => void;
    'openai-response': (msg: string) => void;
}

export interface ClientToServerEvents {
    'query-input-change': (data: { msg: string, transaction: number }) => void;
    'query-submit': (msg: string) => void;
    'query-submit-continue': () => void;
}
