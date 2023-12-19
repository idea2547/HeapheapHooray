// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@v4.9.3/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@v4.9.3/access/Ownable.sol";

contract TutorPlatform is ERC721, Ownable {

    uint256 public postIdCounter;
    uint256 public commentIdCounter;

    mapping(uint256 => Post) public posts;
    mapping(address => mapping(uint256 => bool)) public isVotePost;
    mapping(address => mapping(uint256 => bool)) public isVoteComment;
    mapping(uint256 => Comment) public comments;
    mapping(address => uint256) public userInteractions;

    struct Post {
        address author;
        string content;
        string title;
        uint256 voteCount;
        uint256 postId;
    }

    struct Comment {
        address author;
        string content;
        uint256 postId;
        uint256 voteCount;
        uint256 commentId;
    }

    event PostCreated(uint256 postId, address indexed author);
    event CommentCreated(uint256 commentId, uint256 postId, address indexed author);
    event VoteCasted(uint256 id, bool isPost, address indexed voter);

    constructor() ERC721("TutorPlatformNFT", "TPNFT") {}

    mapping(address => uint256[]) private authorToPostIds;
    mapping(uint256 => uint256[]) private postToCommentIds;

    function createPost(string memory _content, string memory _title) external {
        uint256 postId = postIdCounter++;
        posts[postId] = Post(msg.sender, _content, _title, 0, postId);
        userInteractions[msg.sender]++;
        
        // Update the mapping to associate the post ID with the author
        authorToPostIds[msg.sender].push(postId);
        
        emit PostCreated(postId, msg.sender);
    }

    function getAuthorPosts() external view returns (uint256[] memory) {
        // Return the array of post IDs created by the msg.sender
        return authorToPostIds[msg.sender];
    }

    function getCommentsByPost(uint256 _postId) external view returns (uint256[] memory) {
        // Return the array of comment IDs associated with the given post ID
        return postToCommentIds[_postId];
    }

    function createComment(uint256 _postId, string memory _content) external {
        require(_postId < postIdCounter, "Invalid postId");

        uint256 commentId = commentIdCounter++;
        comments[commentId] = Comment(msg.sender, _content, _postId, 0, commentId);
        userInteractions[msg.sender]++;

        // Update the mapping to associate the comment ID with the post ID
        postToCommentIds[_postId].push(commentId);

        emit CommentCreated(commentId, _postId, msg.sender);
    }

    function vote(uint256 _id, bool _isPost) external {
        require(_isPost ? _id < postIdCounter : _id < commentIdCounter, "Invalid id");
        
        if (_isPost) {
            require(!isVotePost[msg.sender][_id], "You have already voted for this post");
            posts[_id].voteCount++;
            isVotePost[msg.sender][_id] = true;
            userInteractions[msg.sender]++;
        } else {
            require(!isVoteComment[msg.sender][_id], "You have already voted for this post");
            comments[_id].voteCount++;
            isVoteComment[msg.sender][_id] = true;
            userInteractions[msg.sender]++;
        }

        
        
        emit VoteCasted(_id, _isPost, msg.sender);
    }

    function mintPostNFT(uint256 _postId) external onlyOwner {
        require(_postId < postIdCounter, "Invalid post id");
        _safeMint(msg.sender, _postId);
    }
}
