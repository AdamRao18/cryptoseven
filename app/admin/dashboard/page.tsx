'use client';

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/database/firebase";
import {
  Users,
  BookOpen,
  FileQuestion,
  Flag,
  Trophy,
  Target,
  Zap,
  UserPlus,
  BookPlus,
  FileQuestionIcon,
  FlagTriangleRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardOverview() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [activeCTFs, setActiveCTFs] = useState<any[]>([]);
  const [ctfLeaderboard, setCtfLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      setTotalUsers(userSnapshot.size);

      const courseSnapshot = await getDocs(collection(db, "courses"));
      setActiveCourses(courseSnapshot.size);

      const quizSnapshot = await getDocs(collection(db, "quiz"));
      setTotalQuizzes(quizSnapshot.size);

      const ctfQuery = query(collection(db, "ctf"), where("status", "==", "active"));
      const ctfSnapshot = await getDocs(ctfQuery);
      const activeCtfList = ctfSnapshot.docs.map((doc) => doc.data());
      setActiveCTFs(activeCtfList);

      const leaderboardQuery = query(
        collection(db, "ctfLeaderboard"),
        orderBy("score", "desc"),
        limit(5)
      );
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = leaderboardSnapshot.docs.map((doc) => doc.data());
      setCtfLeaderboard(leaderboardData);
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Courses",
      value: activeCourses,
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Quiz",
      value: totalQuizzes,
      icon: FileQuestion,
      color: "text-purple-600",
    },
    {
      title: "CTF Challenges",
      value: activeCTFs.length,
      icon: Flag,
      color: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "Manage Courses",
      description: "View and manage all courses",
      icon: BookPlus,
      action: "Go to Courses",
      path: "/admin/course-management/create",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    {
      title: "Manage Quizzes",
      description: "Edit quizzes and questions",
      icon: FileQuestionIcon,
      action: "Go to Quizzes",
      path: "/admin/quiz-management/create",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      title: "Manage CTFs",
      description: "View and add new CTFs",
      icon: FlagTriangleRight,
      action: "Go to CTFs",
      path: "/admin/ctf-management/create",
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6 p-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTF Analytics + Leaderboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              CTF Analytics
            </CardTitle>
            <CardDescription>Currently active CTFs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCTFs.length === 0 && (
              <p className="text-sm text-muted-foreground">No active CTFs</p>
            )}
            {activeCTFs.map((ctf) => (
              <div key={ctf.id} className="border p-3 rounded-lg">
                <h4 className="font-semibold text-sm">{ctf.title}</h4>
                <p className="text-xs text-muted-foreground">{ctf.description}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {ctf.categories.length} categories · {ctf.questions.length} questions
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>From CTF Leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ctfLeaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground">No leaderboard data</p>
              )}
              {ctfLeaderboard.map((performer, i) => (
                <div
                  key={performer.userId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
                      {["🥇", "🥈", "🥉"][i] || i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{performer.username}</p>
                      <p className="text-xs text-muted-foreground">{performer.score} points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Management shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <div
                key={action.title}
                className="group cursor-pointer"
                onClick={() => (window.location.href = action.path)}
              >
                <div className="flex items-start gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      {action.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
