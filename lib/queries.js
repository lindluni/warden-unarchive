exports.unarchiveRepo = `
mutation UnArchiveRepository($repoID: String!) {
    unarchiveRepository(input: {repositoryId: $repoID}) {
        repository {
          isArchived
        }
  }
}`

exports.getRepoID = `
query GetRepoID($org: String!, $repo: String!) {
    repository(owner: $org, name: $repo){
        id,
        isArchived,
    }
}`