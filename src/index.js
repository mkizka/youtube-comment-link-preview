const safeHtml = (html, tagName) => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, `text/html`);
  return parsed.querySelector(tagName);
};

const waitTarget = () => {
  return new Promise((resolve) => {
    const initInterval = setInterval(() => {
      const comments = document.querySelector("ytd-comments#comments");
      if (comments) {
        clearInterval(initInterval);
        resolve(comments);
      }
    }, 100);
  });
};

const createObserver = () => {
  return new MutationObserver(async (records) => {
    for (const record of records) {
      for (const node of [...record.addedNodes]) {
        if (
          node.id === "content-text" &&
          node.tagName.toLowerCase() === "yt-formatted-string"
        ) {
          const links = node.querySelectorAll("a.yt-formatted-string");
          if (links) {
            for (let link of links) {
              const url = parseURL(link.href);
              if (url.isValid && !url.isTimeAnchor) {
                const { title, image } = await fetchTitleAndImage(
                  url.youtubeUrl
                );
                link.textContent = title + "\n";
                const thumbnail = safeHtml(
                  `<img src="${image}" width="50%">`,
                  "img"
                );
                link.appendChild(thumbnail);
              }
            }
          }
        }
      }
    }
  });
};

const parseURL = (href) => {
  const url = new URL(href);
  const videoId = url.searchParams.get("v") || url.pathname.slice(1);
  return {
    isValid: /(youtu\.be|youtube\.com)$/.test(url.host),
    isTimeAnchor: url.searchParams.get("t") != null,
    videoId,
    youtubeUrl: "https://www.youtube.com/watch?v=" + videoId,
  };
};

const fetchTitleAndImage = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  const el = safeHtml(text, "body");
  console.log(el);
  return {
    title: el.querySelector("title").text,
    image: el.querySelector('meta[property="og:image"]').content,
  };
};

const main = async () => {
  const target = await waitTarget();
  const observer = createObserver();
  observer.observe(target, {
    childList: true,
    subtree: true,
  });
};

main();
