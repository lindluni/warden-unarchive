const fs = require('fs')

const core = require('@actions/core')

const {octokit} = require('./lib/auth')
const {getRepoID, unarchiveRepo} = require('./lib/queries')

async function readCSV(filename) {
    core.info(`Reading repository list from ${filename}`)
    const file = await fs.readFileSync(filename, 'utf8');
    const lines = file.split('\n');
    return lines.map(line => {
        const repo = line.split(',')
        return {
            org: repo[0],
            name: repo[1]
        }
    }).filter(repo => {
        if (repo.org !== '') {
            return repo
        }
    });
}

async function getRepoState(org, repo) {
    core.info(`Retrieving repository state and ID for ${org}/${repo}`)
    return await octokit.graphql(getRepoID, {
        org: org,
        repo: repo
    })
}

async function unarchive(repoID) {
    core.info(`Unarchiving repository with ID ${repoID}`)
    return await octokit.graphql(unarchiveRepo, {
        repoID: repoID
    })
}


async function main() {
    try {
        const _file = core.getInput('file', {required: true})
        const repos = await readCSV(_file)
        for (const repo of repos) {
            const state = await getRepoState(repo.org, repo.name)
            if (state.repository.isArchived) {
                const unarchivedState = await unarchive(state.repository.id)
                if (!unarchivedState.unarchiveRepository.repository.isArchived) {
                    core.info(`Successfully unarchived ${repo.org}/${repo.name}`)
                } else {
                    core.warning(`Failed unarchiving ${repo.org}/${repo.name}`)
                }
                continue
            }
            core.info(`Skipping non-archived repo ${repo.org}/${repo.name}`)
        }
    } catch (e) {
        core.setFailed(e)
    }
}

main()