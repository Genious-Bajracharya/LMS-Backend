import { Request, Response, NextFunction } from "express";
import Progress from "../models/Progress";
import { ErrorResponse } from "../middlewares/errorMiddleware";

interface AuthRequest extends Request {
  user?: any;
}

//conditon to check for completion
const isCompleted = (
  watchedDuration: number,
  videoDuration: number,
  minPercent = 0.9,
  allowMarginSeconds = 5
) => {
  if (videoDuration <= 0) return false;
  const percent = watchedDuration / videoDuration;
  if (percent >= minPercent) return true;
  if (watchedDuration >= Math.max(0, videoDuration - allowMarginSeconds)) return true;
  return false;
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, videoId, watchedDuration, videoDuration } = req.body;

    // Basic validations
    if (!courseId || !videoId || !videoDuration || watchedDuration === undefined) {
      return next(new ErrorResponse("Missing required fields", 400));
    }
    if (typeof watchedDuration !== "number" || watchedDuration < 0) {
      return next(new ErrorResponse("Invalid watchedDuration value", 400));
    }
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user._id; // Assuming req.user is set via auth middleware

    let progress = await Progress.findOne({ user: userId, course: courseId, video: videoId });

    if (!progress) {
      progress = new Progress({
        user: userId,
        course: courseId,
        video: videoId,
        watchedDuration,
        videoDuration,
        completed: watchedDuration >= videoDuration - 5,
      });
    } else {
      // Only update if user watched further
      if (watchedDuration > progress.watchedDuration) {
        progress.watchedDuration = watchedDuration;
        progress.completed = watchedDuration >= videoDuration - 5;
      }
    }

    await progress.save();

    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse("Failed to update progress", 500));
  }
};

export const getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user._id;
    if (!courseId) {
      return next(new ErrorResponse("Course ID is required", 400));
    }

    const progress = await Progress.find({ user: userId, course: courseId })
      .populate("video", "title duration");

    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse("Failed to fetch progress", 500));
  }
};



// import { Request, Response, NextFunction } from "express";
// import mongoose from "mongoose";
// import Progress from "../models/Progress";
// import Video from "../models/Video";
// import Course from "../models/Course";
// import { ErrorResponse } from "../middleware/errorMiddleware";

// interface AuthRequest extends Request {
//   user?: any;
// }

// /**
//  * Helper: determine if a video is "completed"
//  * - thresholdPct: percentage of video that must be watched (default 0.9 => 90%)
//  * - allowMarginSeconds: if watchedDuration >= videoDuration - allowMarginSeconds => completed
//  */
// const isCompleted = (
//   watchedDuration: number,
//   videoDuration: number,
//   thresholdPct = 0.9,
//   allowMarginSeconds = 5
// ) => {
//   if (videoDuration <= 0) return false;
//   const pct = watchedDuration / videoDuration;
//   if (pct >= thresholdPct) return true;
//   if (watchedDuration >= Math.max(0, videoDuration - allowMarginSeconds)) return true;
//   return false;
// };

// /**
//  * POST /api/progress
//  * body: { courseId, videoId, watchedDuration, videoDuration? }
//  *
//  * Updates or creates progress for the current user on a specific video,
//  * marks it completed if threshold reached, and returns updated courseProgress %
//  * plus the saved progress record.
//  */
// export const updateProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?._id;
//     const { courseId, videoId, watchedDuration, videoDuration } = req.body;

//     if (!userId) return next(new ErrorResponse("Not authenticated", 401));
//     if (!courseId || !videoId || watchedDuration == null) {
//       return next(new ErrorResponse("Missing required fields: courseId, videoId, watchedDuration", 400));
//     }

//     // Ensure ids are valid ObjectIds
//     if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(videoId)) {
//       return next(new ErrorResponse("Invalid courseId or videoId", 400));
//     }

//     // Fetch video to get duration if not provided
//     let video = await Video.findById(videoId).select("duration");
//     if (!video) return next(new ErrorResponse("Video not found", 404));

//     const actualVideoDuration = videoDuration ?? (video as any).duration ?? 0;

//     // compute completed flag
//     const completed = isCompleted(Number(watchedDuration), Number(actualVideoDuration));

//     // Upsert progress document
//     const progress = await Progress.findOneAndUpdate(
//       { user: userId, course: courseId, video: videoId },
//       {
//         $set: {
//           watchedDuration: Math.max(0, Number(watchedDuration)),
//           videoDuration: Number(actualVideoDuration),
//           completed: completed
//         }
//       },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     // Compute overall course progress (weighted by video durations)
//     const course = await Course.findById(courseId).populate("videos", "duration");
//     if (!course) {
//       return next(new ErrorResponse("Course not found", 404));
//     }

//     const videos = (course as any).videos as Array<{ _id: mongoose.Types.ObjectId; duration?: number }>;
//     // totalDuration = sum of video durations (ignore videos with zero duration)
//     const videoDurations = videos.map(v => Number(v.duration) || 0);
//     const totalDuration = videoDurations.reduce((acc, d) => acc + d, 0);

//     // Fetch user's progress records for all videos in this course
//     const progresses = await Progress.find({
//       user: userId,
//       course: courseId,
//       video: { $in: videos.map(v => v._id) }
//     });

//     // compute weighted watched seconds sum
//     let watchedSecondsSum = 0;
//     // Map progress by video id
//     const progressMap = new Map<string, number>();
//     for (const p of progresses) {
//       progressMap.set(p.video.toString(), p.watchedDuration);
//     }

//     for (let i = 0; i < videos.length; i++) {
//       const vid = videos[i];
//       const dur = Number(vid.duration) || 0;
//       const watched = progressMap.get(vid._id.toString()) ?? 0;
//       watchedSecondsSum += Math.min(watched, dur); // cap at video duration
//     }

//     // If totalDuration is zero (no durations provided), fallback to average percent across videos (unweighted)
//     let courseCompletionPct = 0;
//     if (totalDuration > 0) {
//       courseCompletionPct = Math.round((watchedSecondsSum / totalDuration) * 10000) / 100; // 2 decimals
//     } else {
//       // unweighted: average of completed flags
//       const completedCount = progresses.filter(p => p.completed).length;
//       courseCompletionPct = videos.length ? Math.round((completedCount / videos.length) * 10000) / 100 : 0;
//     }

//     res.json({
//       success: true,
//       progress,
//       courseProgress: courseCompletionPct // number 0-100, 2 decimal places
//     });
//   } catch (err) {
//     console.error("updateProgress error:", err);
//     next(new ErrorResponse("Failed to update progress", 500));
//   }
// };

// /**
//  * GET /api/progress/course/:courseId
//  * Returns the current user's progress for the course, plus computed overall course %
//  */
// export const getCourseProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?._id;
//     const { courseId } = req.params;

//     if (!userId) return next(new ErrorResponse("Not authenticated", 401));
//     if (!courseId) return next(new ErrorResponse("Missing courseId", 400));

//     const course = await Course.findById(courseId).populate("videos", "duration title");
//     if (!course) return next(new ErrorResponse("Course not found", 404));

//     const videos = (course as any).videos as Array<{ _id: mongoose.Types.ObjectId; duration?: number; title?: string }>;
//     const videoIds = videos.map(v => v._id);

//     const progresses = await Progress.find({ user: userId, course: courseId }).populate("video", "title duration");

//     // Build response list with video metadata + watchedDuration + completed
//     const progressList = videos.map(v => {
//       const p = progresses.find(pr => pr.video.toString() === v._id.toString());
//       return {
//         videoId: v._id,
//         title: v.title,
//         duration: Number(v.duration) || 0,
//         watchedDuration: p ? p.watchedDuration : 0,
//         completed: p ? p.completed : false,
//         updatedAt: p ? p.updatedAt : null
//       };
//     });

//     // Reuse the same weighted computation as updateProgress
//     const totalDuration = videos.reduce((acc, v) => acc + (Number(v.duration) || 0), 0);
//     const watchedSecondsSum = progressList.reduce((acc, item) => acc + Math.min(item.watchedDuration, item.duration), 0);
//     const courseCompletionPct = totalDuration > 0
//       ? Math.round((watchedSecondsSum / totalDuration) * 10000) / 100
//       : Math.round((progressList.filter(p => p.completed).length / (progressList.length || 1)) * 10000) / 100;

//     res.json({
//       success: true,
//       courseId,
//       courseTitle: (course as any).title,
//       courseProgress: courseCompletionPct,
//       videos: progressList
//     });
//   } catch (err) {
//     console.error("getCourseProgress error:", err);
//     next(new ErrorResponse("Failed to fetch course progress", 500));
//   }
// };

// /**
//  * GET /api/progress/admin/course/:courseId
//  * Admin only endpoint — returns per-student progress for the given course
//  * Query params: ?limit=&skip=
//  */
// export const getCourseProgressAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     // isAdmin middleware should guard this route, but double-check
//     if (!req.user || req.user.role !== "admin") {
//       return next(new ErrorResponse("Not authorized as admin", 403));
//     }

//     const { courseId } = req.params;
//     const limit = Math.min(Number(req.query.limit) || 50, 200);
//     const skip = Math.max(Number(req.query.skip) || 0, 0);

//     if (!courseId) return next(new ErrorResponse("Missing courseId", 400));
//     const course = await Course.findById(courseId).populate("videos", "duration");
//     if (!course) return next(new ErrorResponse("Course not found", 404));

//     const videos = (course as any).videos as Array<{ _id: mongoose.Types.ObjectId; duration?: number }>;
//     const videoIds = videos.map(v => v._id);

//     // aggregate per user: sum watchedDuration and sum videoDuration (for relevant videos), and count completed videos
//     const agg = await Progress.aggregate([
//       { $match: { course: new mongoose.Types.ObjectId(courseId), video: { $in: videoIds } } },
//       {
//         $group: {
//           _id: "$user",
//           totalWatchedSeconds: { $sum: "$watchedDuration" },
//           // totalPossibleSeconds is not stored in Progress; we will sum video durations client-side using videos array.
//           completedCount: { $sum: { $cond: ["$completed", 1, 0] } }
//         }
//       },
//       { $sort: { totalWatchedSeconds: -1 } },
//       { $skip: skip },
//       { $limit: limit }
//     ]);

//     // compute totalCourseDuration
//     const totalCourseDuration = videos.reduce((acc, v) => acc + (Number(v.duration) || 0), 0) || 0;

//     // enrich with user info
//     // fetch user docs for the user ids returned by agg
//     const userIds = agg.map(a => a._id);
//     const users = await mongoose.model("User").find({ _id: { $in: userIds } }).select("name email");

//     // map users
//     const userMap = new Map<string, any>();
//     for (const u of users) userMap.set(u._id.toString(), u);

//     // build response
//     const rows = agg.map(a => {
//       const uid = a._id.toString();
//       const user = userMap.get(uid) || { _id: uid, name: "Unknown", email: "" };
//       const watched = a.totalWatchedSeconds;
//       const pct = totalCourseDuration > 0 ? Math.round((watched / totalCourseDuration) * 10000) / 100 : null;
//       return {
//         user: { _id: uid, name: user.name, email: user.email },
//         totalWatchedSeconds: watched,
//         completedVideos: a.completedCount,
//         courseProgressPct: pct // null if totalCourseDuration == 0
//       };
//     });

//     res.json({
//       success: true,
//       courseId,
//       courseTitle: (course as any).title,
//       totalCourseDuration,
//       rows
//     });
//   } catch (err) {
//     console.error("getCourseProgressAdmin error:", err);
//     next(new ErrorResponse("Failed to fetch admin course progress", 500));
//   }
// };
