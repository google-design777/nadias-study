export default {
  tags: ["posts"],
  layout: "post.njk",
  permalink: (data) => `/posts/${data.page.fileSlug}/index.html`,
};
