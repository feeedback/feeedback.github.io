function get_tools(repo) {
  fetch(`https://api.github.com/repos/${repo}/topics`, {
    headers: {
      Accept: 'application/vnd.github.mercy-preview+json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const name = repo.split('/')[1];
      const parent = document.getElementById(`${name}-tools`);
      parse_tools(data.names).forEach((t) => parent.appendChild(t));
    });
}

function parse_tools(tools) {
  const classes = 'badge badge-pill text-primary border border-primary ml-1';
  const classesArr = classes.split(' ');
  return tools.map((tool) => {
    const span = document.createElement('span');
    span.classList.add(...classesArr);
    span.innerHTML = tool;
    return span;
  });
}
