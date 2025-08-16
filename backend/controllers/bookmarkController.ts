// backend/controllers/bookmarkController.ts
import { Request, Response } from 'express';
import Bookmark from '../models/Bookmark';
import Activity from '../models/Activity';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const addBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  const { resource } = req.body;
//   try {
//     const bookmark = new Bookmark({ user: req.user.id, resource });
//     await bookmark.save();
//     await new Activity({ user: req.user.id, action: 'bookmark', target: bookmark._id.toString() }).save();
//     res.json(bookmark);
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }


try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ msg: 'Unauthorized' });
      return;
    }
    const bookmark = new Bookmark({ user: userId, resource });
    await bookmark.save();
    await new Activity({ user: userId, action: 'bookmark', target: bookmark._id.toString() }).save();
    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const bookmarks = await Bookmark.find({ user: req.user.id });
//     res.json(bookmarks);
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }

try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ msg: 'Unauthorized' });
      return;
    }
    const bookmarks = await Bookmark.find({ user: userId });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};