import React from "react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

const Post = ({ post }) => {
  const [text, setText] = useState(post.textLimit);
  const [showButton, setShowButton] = useState(true);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-2 w-150">
      <div className="text-gray-800">
        <strong>Text:</strong> {text} {/* Display limited text */}
      </div>

      {showButton && (
        <button
          type="button"
          className="px-2 py-1 text-xs cursor-pointer font-medium text-center text-dark bg-white border rounded-lg float-right"
          onClick={() => {
            setText(post.text);
            setShowButton(false); // Hide the button
          }}
        >
          Show more..
        </button>
      )}

      <div className="text-gray-700 mt-5">
        <button
          type="button"
          className="text-gray-900 bg-white mr-2 hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex items-center"
        >
          <img src="/like.svg" alt="Logo" className="w-4 h-4 mr-1" />
          {post.likes}
        </button>

        <button
          type="button"
          className="text-gray-900 bg-white mr-2 hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex items-center"
        >
          <img src="/comment.svg" alt="Logo" className="w-4 h-4 mr-1" />
          {post.comments}
        </button>

        <button
          type="button"
          className="text-gray-900 bg-white mr-2 hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex items-center"
        >
          <img src="/share.svg" alt="Logo" className="w-4 h-4 mr-1" />
          {post.shares}
        </button>
      </div>

      <div className="text-gray-800 mt-4">
        <strong>Time:</strong> {post.time}
      </div>

      <div className="text-gray-800 my-2">
        <strong>Summary:</strong>

        <ReactMarkdown>{post.summary}</ReactMarkdown>
      </div>

      <div className="text-center">
        <a href={post.url} target="_blank">
          <button
            type="button"
            class="text-white cursor-pointer bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 focus:ring-green-800 font-medium rounded-lg text-sm px-4 py-2 text-center"
          >
            URL
          </button>
        </a>
      </div>
    </div>
  );
};

export default Post;
