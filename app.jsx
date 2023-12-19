State.init({
  selectedTab: "home",
  pagePostId: 0,
  postIdCounter: 0,
  commentCounter: 0,
});

const abi = fetch(
  `https://gist.githubusercontent.com/idea2547/2e993b25c45e150d14d1e0077de47e6d/raw/337986ada07a870838a6a977f6d48176fb995353/gistfile1.txt`
);

if (state.sender == undefined && Ethers.provider()) {
  const receiver = Ethers.provider()
    .send("eth_requestAccounts", [])
    .then((accounts) => {
      if (accounts.length) {
        State.update({ sender: accounts[0] });
      }
    });
  State.update({ postNumber: `${receiver}` });
  Ethers.provider()
    .getNetwork()
    .then((chainIdData) => {
      if (chainIdData?.chainId) {
        State.update({ chainId: chainIdData.chainId });
      }
    });
}

const TutorContract = new ethers.Contract(
  "0x1D7098360A9e77A58C4D38df9261335bD74d44d5",
  abi.body,
  Ethers.provider()
);

const handleAllPostClick = () => {
  fetchAllPost();
  State.update({
    selectedTab: "allPost",
  });
};

const handleHomeClick = () => {
  State.update({
    selectedTab: "home",
  });
};

const handleMyPostClick = () => {
  fetchMyPost();
  State.update({
    selectedTab: "myPost",
    pagePostId: postId,
  });
};

const handleViewClick = (postId) => {
  fetchComments(postId);
  State.update({
    selectedTab: "viewPost",
    pagePostId: postId,
  });
  console.log("ppid", pagePostId);
};

TutorContract.postIdCounter().then((result) => {
  State.update({ postIdCounter: Big(result).toNumber() });
});

TutorContract.commentIdCounter().then((result) => {
  State.update({ commentCounter: Big(result).toNumber() });
});

const pageStyle = {
  fontFamily: "Verdana , san-serif", // Example font family
  backgroundColor: "#FFFFFF", // Example background color
  padding: "4%", // Example padding
  color: "#000", // Example text color
  height: "100vh",
};

const boxStyle = {
  padding: "15px",
  margin: "0px",
  display: "inline-block",
  backgroundColor: "#0D1282",
  color: "#fff",
  cursor: "pointer",
  float: "left",
  display: "block",
};

const myPostBoxStyle = {
  ...boxStyle,
  backgroundColor: "#fff",
};

const navbarContainerStyle = {
  margin: "0px",
  display: "flex",
  backgroundColor: "#0D1282",
  fontFamily: "Verdana , san-serif",
};

const heapHeapHoorayBoxStyle = {
  ...boxStyle,
  fontFamily: "Verdana , sans-serif", // Different background color for "Heapheap Hooray"
  fontSize: "20px",
};

const textA = () => {
  const [commentContent, setCommentContent] = useState("");
  console.log(commentContent);
  const handleComment = () => {
    try {
      TutorContract.createComment(state.postId, commentContent).then(
        (transactionHash) => {
          console.log(transactionHash);
        }
      );
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };
  return (
    <div class="comments-section" style={{ marginTop: "5%" }}>
      <div class="mb-3">
        <label class="form-label">Your Comment:</label>
        <textarea
          id="postContent"
          name="postContent"
          placeholder=" Share your though"
          rows="4"
          style={{ width: "100%", fontSize: "15px" }}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          required
        ></textarea>
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        style={{
          marginLeft: "auto",
          display: "block",
          backgroundColor: "#0D1282",
          color: "white",
        }}
        onClick={() => handleComment()}
      >
        Submit Comment
      </button>
    </div>
  );
};

const [posts, setPosts] = useState([]);

const fetchAllPost = () => {
  const fetchData = () => {
    try {
      console.log("spicsc", postIdCounter);
      const fetchedPosts = [];
      for (let i = 0; i <= state.postIdCounter; i++) {
        TutorContract.posts([i]).then((result) => {
          console.log(result);
          State.update({});
          console.log("-----------------");
          let post = {
            title: result[2],
            votingPoints: Big(result[3]).toNumber(),
            author: result[0],
            postId: Big(result[4]).toNumber(),
          };
          console.log(post);
          fetchedPosts.push(post);
        });
      }

      setPosts(fetchedPosts);
      console.log(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts from the contract:", error);
    }
  };

  fetchData();
};

const fetchMyPost = () => {
  const fetchData = () => {
    try {
      const fetchedPosts = [];
      for (let i = 0; i <= state.postIdCounter; i++) {
        TutorContract.posts([i]).then((result) => {
          console.log(result);
          State.update({});
          console.log("-----------------");
          if (result[0].toLowerCase() == state.sender.toLowerCase()) {
            let post = {
              title: result[2],
              votingPoints: Big(result[3]).toNumber(),
              author: result[0],
              postId: Big(result[4]).toNumber(),
            };
            console.log(post);
            fetchedPosts.push(post);
          }
        });
      }
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts from the contract:", error);
    }
  };

  fetchData();
};

const [commentData, setCommentData] = useState([]);

const fetchComments = (postId) => {
  const fetchData = () => {
    try {
      const fetchedComments = [];
      for (let i = 0; i <= state.commentCounter; i++) {
        TutorContract.comments([i]).then((result) => {
          console.log(result);
          State.update({});
          console.log("-----------------");
          if (Big(result[2]).toNumber() == postId) {
            let com = {
              comment: result[1],
              votingPoints: Big(result[3]).toNumber(),
              author: result[0],
              datetime: "2023-10-19 19:00",
            };
            console.log(com);
            fetchedComments.push(com);
          }
        });
      }

      setCommentData(fetchedComments);
    } catch (error) {
      console.error("Error fetching posts from the contract:", error);
    }
  };

  fetchData();
};

const Post = ({ post }) => {
  const postBoxStyle = {
    width: "97%", // Adjust the width as needed
    margin: "0px",
    marginLeft: "1%",
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid transparent", // Transparent main border
    borderBottom: "1px solid #ccc", // Visible right border
  };

  const votingSectionStyle = {
    width: "20%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    color: "#0D1282",
    fontSize: "13px",
  };

  const buttonStyle = {
    padding: "10px 15px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    outline: "none",
    marginLeft: "15%",
  };
  return (
    <div style={postBoxStyle}>
      <div className="comment">
        <Link
          onClick={() => handleViewClick(post.postId)}
          selected={state.selectedTab === "viewPost"}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {/* Replace <h5> with Link component */}
          <div>{post.title}</div>
        </Link>
        <div style={{ color: "#333", fontSize: "12px" }}>{post.author}</div>
        <div className="comment-info"></div>
      </div>

      <div style={votingSectionStyle}>
        <p style={{ margin: "10px", fontSize: "20px", color: "#0D1282" }}>
          {post.votingPoints}
        </p>
        Vote(s)
      </div>
    </div>
  );
};

const home = () => {
  const boxContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };
  const menuBoxStyle = {
    width: "200px",
    height: "200px",
    margin: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "#000",
    border: "2px solid #0D1282",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
  };

  const logoStyle = {
    fontFamily: "Verdana , san-serif", // Replace 'ArtisticFont' with your desired artistic font
    color: "#0D1282",
    fontSize: "60px",
  };

  if (state.sender) {
    if (state.chainId !== 25925) {
      return (
        <div>
          <h3>Wrong Network - We currently support bitkub chain</h3>
        </div>
      );
    }
    return (
      <>
        <div style={pageStyle}>
          <div style={{ textAlign: "center" }}>
            <a style={logoStyle}>HeapHeap Hooray</a>
            <div style={boxContainerStyle}>
              <div
                style={menuBoxStyle}
                onClick={() => handleAllPostClick()}
                selected={state.selectedTab === "allPost"}
              >
                All Post
              </div>
              <a
                style={menuBoxStyle}
                onMouseLeave={handleMouseLeave}
                href="teama.near/widget/CreatePost"
              >
                Create Post
              </a>
              <div
                style={menuBoxStyle}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleMyPostClick()}
                selected={state.selectedTab === "myPost"}
              >
                My Post
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    // output connect button for anon user
    return <Web3Connect />;
  }
};

const viewPost = (pagePostId) => {
  const postId = pagePostId;

  console.log("PostIdType:", typeof postId);
  console.log("PostId:", postId);

  const Comment = ({ comments }) => {
    const commentBoxStyle = {
      width: "97%", // Adjust the width as needed
      margin: "0px",
      marginLeft: "1%",
      padding: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid transparent", // Transparent main border
      borderBottom: "1px solid #ccc", // Visible right border
    };

    const votingSectionStyle = {
      width: "20%",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    };

    const buttonStyle = {
      padding: "10px 15px",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      outline: "none",
      marginLeft: "15%",
    };
    return (
      <div style={commentBoxStyle}>
        <div className="comment">
          <div>{comments.comment}</div>
          <div style={{ color: "#333", fontSize: "12px" }}>
            {comments.author}
          </div>
          <div className="comment-info">
            <p style={{ color: "#333", fontSize: "12px" }}></p>
          </div>
        </div>

        <div style={votingSectionStyle}>
          <p style={{ margin: "10px", fontSize: "20px", color: "#0D1282" }}>
            {comments.votingPoints}
          </p>
          <button
            type="button"
            style={buttonStyle}
            className="btn btn-success vote-btn"
            onClick={() => handleVoteComment(0)}
          >
            Vote
          </button>
        </div>
      </div>
    );
  };

  TutorContract.posts([postId]).then((result) => {
    State.update({
      author: result[0],
      content: result[1],
      title: result[2],
      votingPoints: Big(result[3]).toNumber(),
      postId: Big(result[4]).toNumber(),
    });
  });

  console.log("data", commentData);

  const [sortOption, setSortOption] = useState("mostVoted");
  const [sortedComments, setSortedComments] = useState([]);

  const handleSortChange = (option) => {
    setSortOption(option);

    if (option === "mostRecent") {
      const sortedByRecent = [...commentData].sort((a, b) => {
        const dateA = new Date(a.datetime);
        const dateB = new Date(b.datetime);

        console.log(dateA, dateB);

        return dateB - dateA;
      });
      setSortedComments(sortedByRecent);
    } else if (option === "mostVoted") {
      const sortedByVote = [...commentData].sort(
        (a, b) => b.votingPoints - a.votingPoints
      );
      setCommentData(sortedByVote);
    }
  };

  const votingSectionStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const handleVotePost = () => {
    try {
      TutorContract.vote(state.postId, 1).then((transactionHash) => {
        console.log(transactionHash);
      });
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };

  const handleVoteComment = (commentId) => {
    try {
      TutorContract.vote(commentId, 0).then((transactionHash) => {
        console.log(transactionHash);
      });
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };

  const [commentContent, setCommentContent] = useState("");

  const handleComment = () => {
    try {
      TutorContract.createComment(state.postId, commentContent).then(
        (transactionHash) => {
          console.log(transactionHash);
        }
      );
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Verdana",
        backgroundColor: "#fff",
        color: "#000",
        height: "100h",
      }}
    >
      <ul style={navbarContainerStyle}>
        <li style={heapHeapHoorayBoxStyle}>
          <a
            style={{ textDecoration: "none", color: "#fff" }}
            onClick={() => handleHomeClick()}
            selected={state.selectedTab === "home"}
          >
            HeapHeap Hooray
          </a>
        </li>
        <li style={boxStyle}>
          <a href="#" style={{ textDecoration: "none", color: "#fff" }}>
            Create Post
          </a>
        </li>
        <li style={boxStyle}>
          <a
            href="#"
            onClick={() => handleAllPostClick()}
            selected={state.selectedTab === "allPost"}
            style={{ textDecoration: "none", color: "#fff" }}
          >
            Search Post
          </a>
        </li>
        <li style={boxStyle}>
          <a
            href="#"
            style={{ textDecoration: "none", color: "#fff" }}
            onClick={() => handleMyPostClick()}
            selected={state.selectedTab === "myPost"}
          >
            My Post
          </a>
        </li>
      </ul>
      <div style={{ padding: "4%" }}>
        <h2>{state.title}</h2>
        <div>
          <p style={{ fontSize: "20px" }}>{state.content}</p>
        </div>
        <div
          style={{ textAlign: "right", marginBottom: "2%", marginRight: "1%" }}
        >
          <div style={{ color: "#333", fontSize: "13px" }}>
            by {state.author}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ marginRight: "1%", color: "#333", fontSize: "13px" }}>
            Love this post?
          </div>
          <div
            style={{
              marginBottom: "0.5%",
              marginRight: "1%",
              color: "#333",
              fontSize: "13px",
            }}
          >
            let's vote it to grow our community!
          </div>
          <div class="votePostContainer" style={votingSectionStyle}>
            <div style={{ fontSize: "30px" }}>{state.votingPoints}</div>
            <button
              type="button"
              className="btn btn-success vote-btn"
              id="votePostBtn"
              style={{
                marginLeft: "2%",
                marginRight: "1%",
                backgroundColor: "#0D1282",
                color: "white",
                padding: "10px 15px",
              }}
              onClick={handleVotePost}
            >
              Vote Post
            </button>
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="sortOptions" className="form-label">
            Sort By:
          </label>
          <select
            id="sortOptions"
            className="form-select"
            onChange={(e) => handleSortChange(e.target.value)}
            value={sortOption}
            style={{
              backgroundColor: "white",
              color: "#333",
              border: "1px solid",
              width: "30%",
            }}
          >
            <option value="default"> default </option>
            <option value="mostVoted">Most Voted</option>
          </select>
        </div>

        <div id="commentsContainer" style={{ marginTop: "5%" }}>
          <h4>Comments</h4>
          {commentData.map((comment, index) => (
            <Comment key={index} comments={comment} />
          ))}
        </div>

        <textA />
      </div>
    </div>
  );
};

const allPost = () => {
  const [sortOption, setSortOption] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);

  useEffect(() => {
    const sortedByVote = [...posts].sort(
      (a, b) => b.votingPoints - a.votingPoints
    );
    setSortedPosts(sortedByVote);
  }, []);

  const handleSortChange = (option) => {
    setSortOption(option);

    if (option === "mostRecent") {
      const sortedByRecent = [posts].sort((a, b) => {
        const dateA = new Date(a.datetime);
        const dateB = new Date(b.datetime);

        console.log(dateA, dateB);

        return dateB - dateA;
      });
      setSortedPosts(sortedByRecent);
    } else if (option === "mostVoted") {
      const sortedByVote = [...posts].sort(
        (a, b) => b.votingPoints - a.votingPoints
      );
      setPosts(sortedByVote);
    }
  };

  return (
    <div className="posts">
      <ul style={navbarContainerStyle}>
        <li style={heapHeapHoorayBoxStyle}>
          <a
            style={{ textDecoration: "none", color: "#fff" }}
            onClick={() => handleHomeClick()}
            selected={state.selectedTab === "home"}
          >
            HeapHeap Hooray
          </a>
        </li>
        <li style={boxStyle}>
          <a
            href="teama.near/widget/CreatePost"
            style={{ textDecoration: "none", color: "#fff" }}
          >
            Create Post
          </a>
        </li>
        <li style={myPostBoxStyle}>
          <a href="#" style={{ textDecoration: "none", color: "#000" }}>
            Search Post
          </a>
        </li>
        <li style={boxStyle}>
          <a
            style={{ textDecoration: "none", color: "#fff" }}
            onClick={() => handleMyPostClick()}
            selected={state.selectedTab === "myPost"}
          >
            My Post
          </a>
        </li>
      </ul>

      <div style={pageStyle}>
        <h1>All Post</h1>
        <div className="mt-3">
          <label htmlFor="sortOptions" className="form-label">
            Sort By:
          </label>
          <select
            id="sortOptions"
            className="form-select"
            onChange={(e) => handleSortChange(e.target.value)}
            value={sortOption}
            style={{
              backgroundColor: "white",
              color: "#333",
              border: "1px solid",
              width: "30%",
            }}
          >
            <option value="default"> default </option>
            <option value="mostVoted">Most Voted</option>
          </select>
        </div>
        {posts.map((post, index) => (
          <Post key={index} post={post} />
        ))}
      </div>
    </div>
  );
};

const myPost = () => {
  return (
    <div>
      <ul style={navbarContainerStyle}>
        <li style={heapHeapHoorayBoxStyle}>
          <a
            style={{ textDecoration: "none", color: "#fff" }}
            onClick={() => handleHomeClick()}
            selected={state.selectedTab === "home"}
          >
            HeapHeap Hooray
          </a>
        </li>
        <li style={boxStyle}>
          <a
            href="teama.near/widget/CreatePost"
            style={{ textDecoration: "none", color: "#fff" }}
          >
            Create Post
          </a>
        </li>
        <li style={boxStyle}>
          <a
            onClick={() => handleAllPostClick()}
            selected={state.selectedTab === "allPost"}
            style={{ textDecoration: "none", color: "#fff" }}
          >
            Search Post
          </a>
        </li>
        <li style={myPostBoxStyle}>
          <a
            href="#"
            style={{ textDecoration: "none", color: "#000" }}
            onClick={() => handleMyPostClick()}
            selected={state.selectedTab === "myPost"}
          >
            My Post
          </a>
        </li>
      </ul>
      <div style={pageStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ marginBottom: "2.5%" }}>History Post:</h3>
        </div>

        {posts.map((post, index) => (
          <Post key={index} post={post} />
        ))}
      </div>
    </div>
  );
};

if (state.sender) {
  if (state.chainId !== 25925) {
    return (
      <div>
        <h3>Wrong Network - We currently support bitkub chain</h3>
      </div>
    );
  }
  return (
    <>
      <div>
        {state.selectedTab === "viewPost" && viewPost(state.pagePostId)}
        {state.selectedTab === "createPost" && (
          <>
            <Widget src="teama.near/widget/CreatePost" />
          </>
        )}
        {state.selectedTab === "allPost" && allPost()}
        {state.selectedTab === "home" && home()}
        {state.selectedTab === "myPost" && myPost()}
      </div>
    </>
  );
} else {
  // output connect button for anon user
  return <Web3Connect />;
}
