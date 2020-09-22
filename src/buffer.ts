export function encode(s: string) {
    return Buffer.from(s, 'ascii');
}

export function decode(b: Buffer) {
    return b.toString('ascii');
}
