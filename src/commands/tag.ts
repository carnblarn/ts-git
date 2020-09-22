import fs from 'fs';
import { exists, repoDir, repoFile } from '../misc';
import { GitRepository } from '../models/GitRepository';
import { GitTag } from '../models/GitTag';
import { objectFind, objectRead } from '../object';

export function tagCreate(
    repo: GitRepository,
    tagName: string,
    object: string,
    type: 'object' | 'ref'
) {
    const tagsFile = repoFile(repo, true, 'refs', 'tags', tagName);
    if (!tagsFile) {
        throw new Error(`Invalid path ${tagName}`);
    }

    if (exists(tagsFile)) {
        throw new Error(`Tag ${tagName} already exists`);
    }

    const sha = objectFind(repo, object, undefined, true);
    if (!sha) {
        throw new Error(`Could not find name ${object}`);
    }
    if (type === 'ref') {
        fs.writeFileSync(tagsFile, sha);
    } else {
        const tag = new GitTag(repo);

        const obj = objectRead(
            repo,
            '9638dbdbb142dce4f5d81bf8958cd02981c78e3b'
        );
        console.log(JSON.stringify(obj));
    }
}
