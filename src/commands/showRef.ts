import { GitRepository } from '../models/GitRepository';

export function showRef(
    repo: GitRepository,
    refs: Record<string, any>,
    withHash = true,
    prefix = ''
) {
    const entries = Object.entries(refs);

    entries.forEach((item) => {
        const [key, value] = item;
        if (typeof value === 'string') {
            const one = withHash ? `${value} ` : ``;
            const two = prefix ? `${prefix}/` : '';
            const three = key;
            console.log(`${one}${two}${three}`);
        } else {
            showRef(
                repo,
                value,
                withHash,
                `${prefix}${prefix ? '/' : ''}${key}`
            );
        }
    });
}
