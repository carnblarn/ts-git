import { GitRepository } from './GitRepository';

export abstract class GitObject {
    repo: GitRepository;
    abstract format: Buffer;

    constructor(repo: GitRepository) {
        this.repo = repo;
    }

    /**
     * This function MUST be implemented by subclasses
     * It must read the objewct's contents from this.data, a bye string
     * and do whatever it takes to convert it into a meaninful representation
     * What exactly that means depends on each subclass
     */
    abstract serialize(): Buffer;
    abstract deserialize(data: Buffer): void;
}

export class GitBlob extends GitObject {
    blobdata: Buffer;
    format = Buffer.from('blob', 'ascii');

    constructor(repo: GitRepository, data: Buffer) {
        super(repo);
        this.blobdata = data;
        this.deserialize(data);
    }

    serialize = () => {
        return this.blobdata;
    };

    deserialize = (data: Buffer) => {
        this.blobdata = data;
    };
}
