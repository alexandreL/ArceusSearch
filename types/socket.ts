export interface ServerToClientEvents {
    ac: (data: { items: Array<string>, transaction: number }) => void;
    'openai-response': (msg: string) => void;
    'openai-fail': () => void;
}

export interface ClientToServerEvents {
    'query-input-change': (data: { msg: string, transaction: number }) => void;
    'query-submit': (data: {query: string, transactionToken: string}) => void;
    'query-submit-continue': () => void;
}
