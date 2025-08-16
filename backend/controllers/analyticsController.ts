// import { Request, Response } from 'express';
// import Activity from '../models/Activity';
// import Post from '../models/Post';
// import User from '../models/User';

// interface AuthRequest extends Request {
//   user?: { id: string };
// }

// export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ msg: 'Unauthorized' });
//       return;
//     }

//     // User's activity analytics
//     const userActivities = await Activity.aggregate([
//       { $match: { user: userId } },
//       { $group: { _id: '$action', count: { $sum: 1 } } },
//       { $sort: { count: -1 } }
//     ]);

//     // User's posts analytics
//     const postStats = await Post.aggregate([
//       { $match: { user: userId } },
//       {
//         $group: {
//           _id: null,
//           totalPosts: { $sum: 1 },
//           totalComments: { $sum: { $size: '$comments' } }
//         }
//       }
//     ]);

//     // Recent activity
//     const recentActivity = await Activity.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .populate('target');

//     // Top posts by engagement
//     const topPosts = await Post.aggregate([
//       { $match: { user: userId } },
//       {
//         $addFields: {
//           commentCount: { $size: '$comments' }
//         }
//       },
//       { $sort: { commentCount: -1, createdAt: -1 } },
//       .limit(5)
//       .select('title comments');
//     ]);

//     res.json({
//       activities: userActivities,
//       postStats: postStats[0] || {
//         totalPosts: 0,
//         totalComments: 0
//       },
//       recentActivity,
//       topPosts
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// };

// export const getGlobalAnalytics = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Global platform statistics
//     const totalUsers = await User.countDocuments();
//     const totalPosts = await Post.countDocuments();
//     const totalActivities = await Activity.countDocuments();

//     // Most active users
//     const activeUsers = await Activity.aggregate([
//       { $group: { _id: '$user', activityCount: { $sum: 1 } } },
//       { $sort: { activityCount: -1 } },
//       { $limit: 10 },
//       {
//         $lookup: {
//           from: 'users',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'user'
//         }
//       },
//       { $unwind: '$user' },
//       {
//         $project: {
//           name: '$user.name',
//           email: '$user.email',
//           activityCount: 1
//         }
//       }
//     ]);

//     // Popular tags
//     const popularTags = await Post.aggregate([
//       { $unwind: '$tags' },
//       { $group: { _id: '$tags', count: { $sum: 1 } } },
//       { $sort: { count: -1 } },
//       { $limit: 20 }
//     ]);

//     // Activity trends (last 7 days)
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     const activityTrends = await Activity.aggregate([
//       { $match: { createdAt: { $gte: sevenDaysAgo } } },
//       {
//         $group: {
//           _id: {
//             date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//             action: '$action'
//           },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { '_id.date': 1 } }
//     ]);

//     res.json({
//       overview: {
//         totalUsers,
//         totalPosts,
//         totalActivities
//       },
//       activeUsers,
//       popularTags,
//       activityTrends
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// };






import { Request, Response } from 'express';
import Activity from '../models/Activity';
import Post from '../models/Post';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: 'Unauthorized' });
      return;
    }

    // User's activity analytics
    const userActivities = await Activity.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // User's posts analytics
    const postStats = await Post.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);

    // Recent activity
    const recentActivity = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('target');

    // Top posts by engagement - Fixed aggregation pipeline
    const topPosts = await Post.aggregate([
      { $match: { user: userId } },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      { $sort: { commentCount: -1, createdAt: -1 } },
      { $limit: 5 },
      { $project: { title: 1, comments: 1, commentCount: 1 } }
    ]);

    res.json({
      activities: userActivities,
      postStats: postStats[0] || {
        totalPosts: 0,
        totalComments: 0
      },
      recentActivity,
      topPosts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getGlobalAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Global platform statistics
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalActivities = await Activity.countDocuments();

    // Most active users
    const activeUsers = await Activity.aggregate([
      { $group: { _id: '$user', activityCount: { $sum: 1 } } },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          activityCount: 1
        }
      }
    ]);

    // Popular tags
    const popularTags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Activity trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityTrends = await Activity.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalActivities
      },
      activeUsers,
      popularTags,
      activityTrends
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};