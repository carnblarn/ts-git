import { encode } from '../buffer';
import { GitCommit } from './GitCommit';

export class GitTag extends GitCommit {
    format = encode('tag');
}
