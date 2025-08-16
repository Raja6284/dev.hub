// import mongoose from "mongoose";
// import { Request, Response } from "express";
// import Post from "../models/Post";
// import Activity from "../models/Activity";
// import { marked } from "marked";

// interface AuthRequest extends Request {
//   user?: { id: string };
// }

// export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
//   const { title, content, tags } = req.body;
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ msg: "Unauthorized" });
//       return;
//     }
    
//     const parsedContent = marked.parse(content);
//     const post = new Post({
//       title,
//       content: parsedContent,
//       rawContent: content, // Store raw markdown for editing
//       user: userId,
//       tags,
//     });
//     await post.save();
    
//     // Populate user info
//     await post.populate('user', 'name email');

//     await new Activity({
//       user: userId,
//       action: "create_post",
//       target: post._id.toString(),
//     }).save();
    
//     res.json(post);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
//   const { title, content, tags } = req.body;
//   const { id } = req.params;
  
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ msg: "Unauthorized" });
//       return;
//     }
    
//     const post = await Post.findById(id);
//     if (!post) {
//       res.status(404).json({ msg: "Post not found" });
//       return;
//     }
    
//     if (post.user.toString() !== userId) {
//       res.status(403).json({ msg: "Not authorized to edit this post" });
//       return;
//     }
    
//     post.title = title || post.title;
//     post.rawContent = content || post.rawContent;
//     post.content = content ? marked.parse(content) : post.content;
//     post.tags = tags || post.tags;
//     post.updatedAt = new Date();
    
//     await post.save();
//     await post.populate('user', 'name email');
    
//     res.json(post);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
//   const { id } = req.params;
  
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ msg: "Unauthorized" });
//       return;
//     }
    
//     const post = await Post.findById(id);
//     if (!post) {
//       res.status(404).json({ msg: "Post not found" });
//       return;
//     }
    
//     if (post.user.toString() !== userId) {
//       res.status(403).json({ msg: "Not authorized to delete this post" });
//       return;
//     }
    
//     await Post.findByIdAndDelete(id);
//     res.json({ msg: "Post deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const getFeed = async (req: Request, res: Response): Promise<void> => {
//   const { page = "1", limit = "10", sort = "createdAt" } = req.query;
//   try {
//     const posts = await Post.find()
//       .populate('user', 'name email')
//       .sort({ [sort as string]: -1 })
//       .skip((parseInt(page as string) - 1) * parseInt(limit as string))
//       .limit(parseInt(limit as string));
      
//     const hasMore = posts.length === parseInt(limit as string);
//     res.json({ posts, hasMore });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const searchPosts = async (req: Request, res: Response): Promise<void> => {
//   const {
//     query,
//     tags,
//     sort = "createdAt",
//     page = "1",
//     limit = "10",
//   } = req.query;
  
//   const filter: any = {};
//   if (query) filter.$text = { $search: query as string };
//   if (tags) filter.tags = { $in: (tags as string).split(",") };

//   try {
//     const posts = await Post.find(filter)
//       .populate('user', 'name email')
//       .sort({ [sort as string]: -1 })
//       .skip((parseInt(page as string) - 1) * parseInt(limit as string))
//       .limit(parseInt(limit as string));
      
//     const total = await Post.countDocuments(filter);
//     const hasMore = (parseInt(page as string) * parseInt(limit as string)) < total;
    
//     res.json({ posts, hasMore, total });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
//   const { postId, text, parentId } = req.body;
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ msg: "Unauthorized" });
//       return;
//     }
    
//     const post = await Post.findById(postId).populate('user', 'name email');
//     if (!post) {
//       res.status(404).json({ msg: "Post not found" });
//       return;
//     }

//     const comment = {
//       text,
//       user: new mongoose.Types.ObjectId(userId),
//       replies: [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     if (parentId) {
//       const addToReplies = (comments: any[], depth = 0): boolean => {
//         if (depth >= 5) return false; // Max depth limit
        
//         for (let c of comments) {
//           if (c._id.toString() === parentId) {
//             c.replies.push(comment);
//             return true;
//           }
//           if (addToReplies(c.replies, depth + 1)) return true;
//         }
//         return false;
//       };
      
//       if (!addToReplies(post.comments)) {
//         res.status(400).json({ msg: "Parent comment not found or max depth reached" });
//         return;
//       }
//     } else {
//       post.comments.push(comment);
//     }
    
//     await post.save();
//     await post.populate('comments.user', 'name email');
    
//     await new Activity({
//       user: userId,
//       action: "comment",
//       target: postId,
//     }).save();
    
//     res.json(post);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const getComments = async (req: Request, res: Response): Promise<void> => {
//   const { postId, depth = "0", page = "1", limit = "10" } = req.query;
//   try {
//     const post = await Post.findById(postId).populate('comments.user', 'name email');
//     if (!post) {
//       res.status(404).json({ msg: "Post not found" });
//       return;
//     }

//     // Simple pagination for top level comments
//     const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
//     const endIndex = startIndex + parseInt(limit as string);
//     const comments = post.comments.slice(startIndex, endIndex);
    
//     const hasMore = endIndex < post.comments.length;
    
//     res.json({ comments, hasMore });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const getPost = async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params;
//   try {
//     const post = await Post.findById(id)
//       .populate('user', 'name email')
//       .populate('comments.user', 'name email');
      
//     if (!post) {
//       res.status(404).json({ msg: "Post not found" });
//       return;
//     }
    
//     res.json(post);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
//   const { userId } = req.params;
  
//   try {
//     const posts = await Post.find({ user: userId })
//       .populate('user', 'name email')
//       .sort({ createdAt: -1 });
      
//     res.json(posts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };






import mongoose from "mongoose";
import { Request, Response } from "express";
import Post from "../models/Post";
import Activity from "../models/Activity";
import User from "../models/User";
import { marked } from "marked";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, tags } = req.body;
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const parsedContent = marked.parse(content);
    const post = new Post({
      title,
      content: parsedContent,
      rawContent: content, // Store raw markdown for editing
      user: userId,
      tags,
    });
    await post.save();
    
    // Populate user info
    await post.populate('user', 'name email');

    await new Activity({
      user: userId,
      action: "create_post",
      target: post._id.toString(),
    }).save();
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, tags } = req.body;
  const { id } = req.params;
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    
    if (post.user.toString() !== userId) {
      res.status(403).json({ msg: "Not authorized to edit this post" });
      return;
    }
    
    post.title = title || post.title;
    post.rawContent = content || post.rawContent;
    post.content = content ? marked.parse(content) : post.content;
    post.tags = tags || post.tags;
    post.updatedAt = new Date();
    
    await post.save();
    await post.populate('user', 'name email');
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    
    if (post.user.toString() !== userId) {
      res.status(403).json({ msg: "Not authorized to delete this post" });
      return;
    }
    
    await Post.findByIdAndDelete(id);
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getFeed = async (req: Request, res: Response): Promise<void> => {
  const { page = "1", limit = "10", sort = "createdAt" } = req.query;
  try {
    const posts = await Post.find()
      .populate('user', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      })
      .sort({ [sort as string]: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
      
    // Transform the posts to include userName in comments
    const transformedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.comments = transformComments(postObj.comments);
      return postObj;
    });
      
    const hasMore = posts.length === parseInt(limit as string);
    res.json({ posts: transformedPosts, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const searchPosts = async (req: Request, res: Response): Promise<void> => {
  const {
    query,
    tags,
    sort = "createdAt",
    page = "1",
    limit = "10",
  } = req.query;
  
  const filter: any = {};
  if (query) filter.$text = { $search: query as string };
  if (tags) filter.tags = { $in: (tags as string).split(",") };

  try {
    const posts = await Post.find(filter)
      .populate('user', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      })
      .sort({ [sort as string]: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
      
    // Transform the posts to include userName in comments
    const transformedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.comments = transformComments(postObj.comments);
      return postObj;
    });
      
    const total = await Post.countDocuments(filter);
    const hasMore = (parseInt(page as string) * parseInt(limit as string)) < total;
    
    res.json({ posts: transformedPosts, hasMore, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Helper function to transform comments and add userName
const transformComments = (comments: any[]): any[] => {
  return comments.map(comment => {
    const transformedComment = {
      ...comment,
      user: comment.user._id || comment.user, // Keep the user ID
      userName: comment.user.name || 'Anonymous', // Add userName field
      replies: comment.replies ? transformComments(comment.replies) : []
    };
    return transformedComment;
  });
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { postId, text, parentId } = req.body;
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    // Get user info
    const user = await User.findById(userId).select('name');
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      text,
      user: new mongoose.Types.ObjectId(userId),
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (parentId) {
      const addToReplies = (comments: any[], depth = 0): boolean => {
        if (depth >= 5) return false; // Max depth limit
        
        for (let c of comments) {
          if (c._id.toString() === parentId) {
            c.replies.push(comment);
            return true;
          }
          if (addToReplies(c.replies, depth + 1)) return true;
        }
        return false;
      };
      
      if (!addToReplies(post.comments)) {
        res.status(400).json({ msg: "Parent comment not found or max depth reached" });
        return;
      }
    } else {
      post.comments.push(comment);
    }
    
    await post.save();
    
    await new Activity({
      user: userId,
      action: "comment",
      target: postId,
    }).save();
    
    // Return the comment data in the format expected by frontend
    const responseComment = {
      _id: comment._id,
      text: comment.text,
      user: userId,
      userName: user.name,
      replies: [],
      createdAt: comment.createdAt
    };
    
    res.json(responseComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  const { postId, depth = "0", page = "1", limit = "10" } = req.query;
  try {
    const post = await Post.findById(postId)
      .populate({
        path: 'comments.user',
        select: 'name email'
      });
      
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }

    // Simple pagination for top level comments
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const comments = post.comments.slice(startIndex, endIndex);
    
    // Transform comments to include userName
    const transformedComments = transformComments(comments);
    
    const hasMore = endIndex < post.comments.length;
    
    res.json({ comments: transformedComments, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id)
      .populate('user', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      });
      
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    
    // Transform the post to include userName in comments
    const postObj = post.toObject();
    postObj.comments = transformComments(postObj.comments);
    
    res.json(postObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  
  try {
    const posts = await Post.find({ user: userId })
      .populate('user', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      })
      .sort({ createdAt: -1 });
    
    // Transform the posts to include userName in comments
    const transformedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.comments = transformComments(postObj.comments);
      return postObj;
    });
      
    res.json(transformedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
