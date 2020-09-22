import { GitRepository } from '../models/GitRepository';
import { objectRead, objectFind } from '../object';

export function catFile(
    repo: GitRepository,
    objectName: string,
    format: Buffer = Buffer.from('blob', 'ascii')
) {
    const object = objectRead(repo, objectFind(repo, objectName, format));
    console.log(object.serialize().toString('ascii'));
}
