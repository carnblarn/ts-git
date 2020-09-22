import chalk from 'chalk';
import { encode } from '../buffer';
import { GitObject } from './GitObject';
import { GitRepository } from './GitRepository';

class GitTreeLeaf {
    sha: string;
    mode: Buffer;
    path: Buffer;

    constructor(mode: Buffer, path: Buffer, sha: string) {
        this.mode = mode;
        this.path = path;
        this.sha = sha;
    }
}

function treeParseHelper(raw: Buffer, start = 0): [number, GitTreeLeaf] {
    // Find the space terminator of the node
    const x = raw.indexOf(encode(' '), start);
    if (!(x - start === 5 || x - start === 6)) {
        throw new Error('The tree index is incorrect');
    }

    // Read the mode
    const mode = raw.slice(start, x);

    // Find the NULL terminator of the path
    const y = raw.indexOf(encode('\x00'), x);
    // and read the path
    const path = raw.slice(x + 1, y);

    // Read the SHA and convert to a hex string
    const sha = raw.slice(y + 1, y + 21).toString('hex');

    return [y + 21, new GitTreeLeaf(mode, path, sha)];
}

function treeParse(raw: Buffer) {
    let position = 0;
    const max = raw.length;

    const ret: GitTreeLeaf[] = [];
    while (position < max) {
        const [pos, data] = treeParseHelper(raw, position);
        position = pos;
        ret.push(data);
    }

    return ret;
}

function treeSerialize(obj: {
    items: {
        mode: Buffer;
        path: Buffer;
        sha: string;
    }[];
}) {
    // FIXME: Add Serializer
    let ret = encode('');
    obj.items.forEach((item) => {
        const sha = parseInt(item.sha, 16);
        Buffer.concat([
            ret,
            item.mode,
            encode(' '),
            item.path,
            encode('\x00'),
            Buffer.alloc(20, sha, 'binary'),
        ]);
    });
    return ret;
}

export class GitTree extends GitObject {
    format = encode('tree');
    items: GitTreeLeaf[];

    constructor(repo: GitRepository, data: Buffer) {
        super(repo);
        this.items = treeParse(data);
    }

    deserialize = (data: Buffer) => {
        this.items = treeParse(data);
    };

    serialize = () => {
        return treeSerialize(this);
    };
}
