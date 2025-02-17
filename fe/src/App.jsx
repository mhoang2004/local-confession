import { useState } from "react";

import Post from "./components/Post";

function App() {
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [posts, setPosts] = useState([]);
  const [numPosts, setNumPosts] = useState("10");
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingSummarize, setLoadingSummarize] = useState(false);

  //   const post = {
  //     text: "This is a long post that will be summarized. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  //     likes: 120,
  //     comments: 45,
  //     shares: 7,
  //     textLimit:
  //       "This is a long post that will be summarized. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.".slice(
  //         0,
  //         100
  //       ) + "...",
  //     summary: "This is a summarized version of the post.",
  //     time: "11/1/2025",
  //     url: "https://www.facebook.com/Utc2Confessions/posts/pfbid02hs3WMzGdY5geZyEwFeUcqyiVUiNmLkU55t5xXbCDjy6LGJ7Drs1HAS8DRyu1d84gl",
  //   };

  const handleSummarizingData = async () => {
    try {
      setMessage("");

      const match = link.match(/^https:\/\/www\.facebook\.com\/([^/?#]+)$/);
      if (!match) {
        setMessage("Invalid link confesstion!");
        return;
      }
      setLoadingSummarize(true);

      const response = await fetch("http://127.0.0.1:8000/get-summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);

      setLoadingSummarize(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFetchData = async () => {
    setMessage("");

    try {
      const match = link.match(/^https:\/\/www\.facebook\.com\/([^/?#]+)$/);
      if (!match) {
        setMessage("Invalid link confesstion!");
        return;
      }

      setLoadingPosts(true);
      const response = await fetch("http://127.0.0.1:8000/get-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link,
          num: numPosts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setMessage(`${data.message}. Total posts: ${data.total_posts}`);
      console.log(data);

      setLoadingPosts(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex justify-center h-screen bg-gray-100 p-5">
      <div>
        <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
          Summarize Confessions.
        </h2>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="p-6 rounded-lg shadow-lg w-150"
        >
          <div className="mb-4">
            <label
              htmlFor="link"
              className="block text-sm font-medium text-gray-700"
            >
              Confessions Link:
            </label>
            <input
              type="text"
              id="link"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
              }}
              placeholder="Enter the post link"
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="numPosts"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Posts:
            </label>
            <select
              id="numPosts"
              value={numPosts}
              onChange={(e) => setNumPosts(e.target.value)}
              required
              className="mt-1 p-2 w-30 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={loadingPosts || loadingSummarize}
              onClick={handleFetchData}
              className="w-full cursor-pointer py-2 px-4 bg-rose-500 text-white rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPosts ? "Getting new posts..." : "Get new posts"}
            </button>

            <button
              type="button"
              disabled={loadingPosts || loadingSummarize}
              onClick={handleSummarizingData}
              className="w-full cursor-pointer py-2 px-4 bg-cyan-600 text-white rounded-md hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSummarize ? "Summarizing..." : "Summarize"}
            </button>
          </div>
        </form>

        <div className="mt-4">
          {loadingPosts && (
            <button
              disabled
              type="button"
              className="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
            >
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 me-3 text-gray-200 animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="#1C64F2"
                />
              </svg>
              Getting Facebook's Posts...
            </button>
          )}

          <div className="mt-4 text-black-800 rounded-md">{message}</div>

          {loadingSummarize && (
            <button
              disabled
              type="button"
              className="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
            >
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 me-3 text-gray-200 animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="#1C64F2"
                />
              </svg>
              Summarizing...
            </button>
          )}

          {posts && posts.map((post) => <Post post={post} />)}

          {/* <Post post={post} /> */}
        </div>
      </div>
    </div>
  );
}

export default App;
