import {
    LayoutDashboard,
    BookOpen,
    Users,
    Gamepad2,
    Sword,
    Target,
    MessageSquare,
    Settings,
    Flag,
    HelpCircle
  } from "lucide-react"
  
  export const FIELD_NAMES = {
    username: "Username",
    email: "Email",
    password: "Password",
  };
  
  export const FIELD_TYPES = {
    username: "text",
    email: "email",
    password: "password",
  };
  
  export const SidebarLinks = {
    learn: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/courses", icon: BookOpen, label: "Courses" },
    ],
    play: [
      { href: "/quizzes", icon: Gamepad2, label: "Quizzes" },
      { href: "/ctf", icon: Sword, label: "Capture The Flag" },
    ],
    social: [
      { href: "/leaderboard", icon: Target, label: "Leaderboard" },
      { href: "/community", icon: MessageSquare, label: "Community" },
      { href: "/referral", icon: Users, label: "Invite Friends" }
    ]
  }

  export const AdminSidebarLinks = {
  "Dashboard": [
    {
      label: "Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
  ],
  "Management": [
    {
      label: "Course Management",
      href: "/admin/course-management",
      icon: Users,
    },
    {
      label: "Quiz Management",
      href: "/admin/quiz-management",
      icon: Settings,
    },
    {
      label: "CTF Management",
      href: "/admin/ctf-management",
      icon: Users,
    },
  ],
}