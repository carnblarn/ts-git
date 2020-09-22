import { encode, decode } from '../buffer';
import { kvlmParse, kvlmSerialize } from '../parser';
import { GitObject } from './GitObject';
import { GitRepository } from './GitRepository';

type GitCommitData = {
    tree: Buffer;
    author: string;
    comitter: string;
    parent: Buffer;
    '': Buffer;
};

export class GitCommit extends GitObject {
    format = encode('commit');
    kvlm: GitCommitData;

    constructor(repo: GitRepository, data: Buffer) {
        super(repo);

        this.kvlm = kvlmParse(data);
        this.deserialize(data);
    }

    deserialize = (data: Buffer) => {
        this.kvlm = kvlmParse(data);
    };

    serialize = () => {
        return kvlmSerialize(this.kvlm);
    };
}
