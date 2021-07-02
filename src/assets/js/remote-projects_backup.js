const { Octokit } = require('@octokit/rest');

const octokit = new Octokit();

const parseTools = (tools) => {
  const classes = 'badge badge-pill text-primary border border-primary ml-1';
  const classesArr = classes.split(' ');
  return tools.map((tool) => {
    const span = document.createElement('span');
    span.classList.add(...classesArr);
    span.innerHTML = tool;
    return span;
  });
};

const getTools = async (owner, repo) => {
  const data = await octokit.repos.getAllTopics({
    owner,
    repo,
  });
  console.log(data);
};
const getTools1 = (repo) => {
  fetch(`https://api.github.com/repos/${repo}/topics`, {
    headers: {
      Accept: 'application/vnd.github.mercy-preview+json',
    },
  })
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error(`${response.status} (${response.statusText})`);
      }
      return response.json();
    })
    .then((data) => {
      // if (data.message === 'Not Found') {
      //     throw new Error('Repository not found');
      // }
      const name = repo.split('/')[1];
      const parent = document.getElementById(`${name}-tools`);
      parseTools(data.names).forEach((t) => parent.appendChild(t));
    })
    .catch((err) => {
      // console.log(err)
    });
};
